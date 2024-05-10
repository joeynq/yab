import type { AppContext } from "@yab/core";
import { ensure } from "@yab/utils";
import Memoirist, { type FindResult } from "memoirist";
import { RouterEvent } from "../event";
import { NotFound } from "../exceptions";
import type {
	RouteMatch,
	RouteObject,
	SlashedPath,
	ValidationFn,
} from "../interfaces";
import {
	getRequestPayload,
	getRequestScope,
	getRouteHandler,
	validate,
} from "../utils";

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
				this.#validator(arg.schema, arg.payload, this.route);
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

	addRouteFromController(
		controller: any,
		route: RouteObject,
		root: SlashedPath = "/",
	) {
		const { method: httpMethod, path, prefix } = route;
		const method = httpMethod.toLowerCase();
		const routePath = `${root}${prefix}${path}`
			.replace(/\/$/, "")
			.replace(/\/\//, "/");
		const handler = getRouteHandler(controller, route);
		this.addRoute(method, routePath, {
			handler,
			prefix: root,
			path: routePath,
			parameters: route.parameters,
			response: route.response,
		});
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
			responses: RouteMatch["response"],
		) => Response,
		errorHandler: <Err extends Error>(
			error: Err,
			responses?: RouteMatch["response"],
		) => Response,
	) {
		this.#ensureMatch();

		const request = this.context.resolve("request") as Request;
		const { logger } = this.context.store;
		const { prefix, path } = this.route.store;
		try {
			logger.info(`Incoming request: ${request.method} ${request.url}`);

			this.#ensureMatch();
			const relativePath = path.replace(prefix, "").replace(/\/$/, "");

			await this.context.store.hooks.invoke(
				RouterEvent.RouteGuard,
				[this.context],
				{ scope: getRequestScope(request.method, relativePath) },
			);

			await this.context.store.hooks.invoke(
				RouterEvent.BeforeHandle,
				[this.context],
				{ scope: getRequestScope(request.method, relativePath) },
			);

			const result = await this.route.store.handler(
				...(await this.#getHandlerArguments()),
			);

			await this.context.store.hooks.invoke(
				RouterEvent.AfterHandle,
				[this.context],
				{ scope: getRequestScope(request.method, relativePath) },
			);

			return responseHandler(result, this.route.store.response);
		} catch (error) {
			logger.error(error as Error, `${request.method} ${request.url} failed`);
			return errorHandler(error as Error, this.#route?.store.response);
		}
	}
}
