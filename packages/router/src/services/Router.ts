import {
	type ContextService,
	type Hooks,
	Injectable,
	type RequestContext,
	type _RequestContext,
} from "@vermi/core";
import { ensure, pathname } from "@vermi/utils";
import Memoirist, { type FindResult } from "memoirist";
import { RouterEvent, type RouterEventMap } from "../event";
import { BadRequest, NotFound } from "../exceptions";
import type { RouteMatch, ValidationFn } from "../interfaces";
import { getRequestScope, validate } from "../utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

@Injectable("SINGLETON")
export class Router {
	#matcher = new Memoirist<RouteMatch>();

	#route?: FindResult<RouteMatch>;

	#debug: ConsoleTable[] = [];

	#validator: ValidationFn = validate;

	get context() {
		ensure(this.contextService.context);
		return this.contextService.context.expose();
	}

	get route() {
		ensure(this.#route, new Error("Route not set"));
		return this.#route;
	}

	get debug() {
		return this.#debug;
	}

	constructor(private contextService: ContextService) {}

	#ensureMatch() {
		const request = this.context.resolve<Request>("request");

		const match = this.#matcher.find(
			request.method.toLowerCase(),
			pathname(request.url),
		);

		ensure(match, new NotFound(`${request.method} ${request.url} not found`));

		this.#route = match;
	}

	async #getHandlerArguments() {
		const payload = this.context.resolve<_RequestContext["payload"]>("payload");
		const args = this.route.store.args;
		if (!args) {
			return [];
		}

		const values: any[] = [];

		for (const arg of args) {
			let value: any = undefined;
			switch (arg.in) {
				case "path":
					value = this.route.params;
					break;
				case "query":
					value = payload.query;
					break;
				case "body":
					value = payload.body;
					break;
				case "header":
					value = payload.headers;
					break;
				case "cookie":
					value = payload.cookies;
					break;
			}

			if (arg.required && value === undefined) {
				throw new BadRequest(`Missing required parameter: ${arg.name}`);
			}

			if (arg.schema && value !== undefined) {
				// value = Value.Clean(arg.schema, value);
				await this.#validator(arg.schema, value, this.route);
			}

			if (arg.pipes) {
				for (const pipe of arg.pipes) {
					value = await this.context.build(pipe).map(value);
				}
			}

			values.push(value);
		}

		return values;
	}

	addRoute(method: string, path: string, store: RouteMatch): RouteMatch {
		this.#debug.push({
			method,
			path: path,
			handler: store.handler.name,
		});
		return this.#matcher.add(method, path, store);
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
				RouterEventMap
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
