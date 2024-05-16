import type { AppContext, Hooks, RequestContext } from "@vermi/core";
import { ensure } from "@vermi/utils";
import Memoirist, { type FindResult } from "memoirist";
import { RouterEvent, type RouterEventMap } from "../event";
import { NotFound } from "../exceptions";
import type { RouteMatch, ValidationFn } from "../interfaces";
import { getRequestPayload, getRequestScope, validate } from "../utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

export class Router {
	#matcher = new Memoirist<RouteMatch>();

	#context?: AppContext;

	#route?: FindResult<RouteMatch>;

	#debug: ConsoleTable[] = [];

	#validator: ValidationFn = validate;

	get route() {
		ensure(this.#route, new Error("Route not set"));
		return this.#route;
	}

	get debug() {
		return this.#debug;
	}

	private get context() {
		ensure(this.#context, new Error("Context not set"));
		return this.#context;
	}

	#ensureMatch() {
		const request = this.context.resolve("request") as Request;
		const serverUrl = this.context.resolve("serverUrl") as string;

		const url = new URL(request.url, serverUrl);

		const match = this.#matcher.find(
			request.method.toLowerCase(),
			url.pathname,
		);

		ensure(match, new NotFound(`${request.method} ${request.url} not found`));

		this.#route = match;
	}

	async #getHandlerArguments() {
		const request = this.context.resolve("request") as Request;
		const args = await getRequestPayload(request, this.route);

		for (const arg of args) {
			if (arg.schema) {
				await this.#validator(arg.schema, arg.payload, this.route);
				if (arg.pipes) {
					for (const pipe of arg.pipes) {
						arg.payload = await this.context.build(pipe).map(arg.payload);
					}
				}
			}
		}

		return args.map((el) => el.payload);
	}

	addRoute(method: string, path: string, store: RouteMatch): RouteMatch {
		this.#debug.push({
			method,
			path: path,
			handler: store.handler.name,
		});
		return this.#matcher.add(method, path, store);
	}

	useContext(context: AppContext) {
		this.#context = context;
	}

	useValidator(validator: ValidationFn) {
		this.#validator = validator;
	}

	async handleRequest(
		responseHandler: <T>(
			result: T,
			responses: RouteMatch["responses"],
		) => Response,
		errorHandler: <Err extends Error>(
			error: Err,
			responses?: RouteMatch["responses"],
		) => Response,
	) {
		this.#ensureMatch();

		const context = this.context as RequestContext;

		const request = context.resolve("request") as Request;
		const { logger } = context.store;
		const { path } = this.route.store;
		try {
			logger.info(`Incoming request: ${request.method} ${request.url}`);

			const relativePath = path.replace(/\/$/, "");
			const scope = getRequestScope(request.method, relativePath);

			const hooks = context.store.hooks as Hooks<
				typeof RouterEvent,
				RouterEventMap,
				RequestContext
			>;

			await hooks.invoke(RouterEvent.RouteGuard, [context, this.route], {
				scope,
			});

			await hooks.invoke(RouterEvent.BeforeHandle, [context, this.route], {
				scope,
			});

			const result = await this.route.store.handler(
				...(await this.#getHandlerArguments()),
			);

			await hooks.invoke(
				RouterEvent.AfterHandle,
				[context, result, this.route],
				{ scope },
			);

			return responseHandler(result, this.route.store.responses);
		} catch (error) {
			logger.error(error as Error, `${request.method} ${request.url} failed`);
			return errorHandler(error as Error, this.#route?.store.responses);
		}
	}
}
