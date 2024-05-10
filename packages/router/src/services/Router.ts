import type { RequestContext } from "@yab/core";
import { ensure } from "@yab/utils";
import Memoirist, { type FindResult } from "memoirist";
import { RouterEvent } from "../event";
import { NotFound } from "../exceptions";
import type { RouteMatch, RouteObject, ValidationFn } from "../interfaces";
import {
	getEventName,
	getRequestPayload,
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

	#context?: RequestContext;

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
		const request = this.context.store.request;
		const serverUrl = this.context.store.serverUrl;

		const url = new URL(request.url, serverUrl);

		const match = this.#matcher.find(
			request.method.toLowerCase(),
			url.pathname,
		);

		ensure(match, new NotFound(`${request.method} ${request.url} not found`));

		this.#route = match;
	}

	async #getHandlerArguments() {
		const { request } = this.context.store;
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

	addRouteFromController(controller: any, route: RouteObject, root = "") {
		const { method: httpMethod, path, prefix } = route;
		const method = httpMethod.toLowerCase();
		const routePath = `${root}${prefix}${path}`.replace(/\/$/, "");
		const handler = getRouteHandler(controller, route);
		this.addRoute(method, routePath, {
			handler,
			prefix,
			path: routePath,
			parameters: route.parameters,
			response: route.response,
		});
	}

	useContext(context: RequestContext) {
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
		const { request, logger } = this.context.store;
		const { prefix, path } = this.route.store;
		try {
			logger.info(`Incoming request: ${request.method} ${request.url}`);

			this.#ensureMatch();
			const relativePath = `${prefix}${path}`.replace(/\/$/, "");

			await this.context.store.hooks.invoke(
				getEventName(RouterEvent.BeforeHandle, request.method, relativePath),
				[this.context.store],
			);

			const result = await this.route.store.handler(
				...(await this.#getHandlerArguments()),
			);

			await this.context.store.hooks.invoke(
				getEventName(RouterEvent.AfterHandle, request.method, relativePath),
				[this.context.store, result],
			);

			return responseHandler(result, this.route.store.response);
		} catch (error) {
			logger.error(error as Error, `${request.method} ${request.url} failed`);
			return errorHandler(error as Error, this.#route?.store.response);
		}
	}
}
