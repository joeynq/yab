import {
	type ContextService,
	type Hooks,
	Injectable,
	type RequestContext,
	asValue,
} from "@vermi/core";
import { ensure, pathname, tryRun } from "@vermi/utils";
import Memoirist, { type FindResult } from "memoirist";
import { RouterEvent, type RouterEventMap } from "../event";
import { NotFound } from "../exceptions";
import type { RouteMatch } from "../interfaces";
import { getRequestScope } from "../utils";

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

	addRoute(method: string, path: string, store: RouteMatch): RouteMatch {
		this.#debug.push({
			method,
			path: path,
			handler: store.handler.name,
		});
		return this.#matcher.add(method, path, store);
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

		const [error, response] = await tryRun(async () => {
			const payload = context.store.payload;

			context.register({
				route: asValue(this.route.store),
				payload: asValue({
					...payload,
					params: this.route.params,
				}),
			});

			logger.info(`Incoming request: ${request.method} ${request.url}`);

			const relativePath = path.replace(/\/$/, "");
			const requestScope = getRequestScope(request.method, relativePath);

			const hooks = context.store.hooks as Hooks<
				typeof RouterEvent,
				RouterEventMap
			>;

			const when = (scope: string) => {
				return requestScope === scope;
			};

			await hooks.invoke(RouterEvent.RouteGuard, [context], {
				when,
			});

			await hooks.invoke(RouterEvent.BeforeHandle, [context], {
				when,
			});

			const result = await this.route.store.handler(context);

			await hooks.invoke(RouterEvent.AfterHandle, [context, result], {
				when,
			});

			return responseHandler(result, this.route.store.responses);
		});

		if (error) {
			logger.error(error, `${request.method} ${request.url} failed`);
			return errorHandler(error, this.#route?.store.responses);
		}

		return response;
	}
}
