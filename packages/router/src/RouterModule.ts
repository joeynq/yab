import type { TObject } from "@sinclair/typebox";
import {
	Hooks,
	type InitContext,
	Inject,
	Logger,
	type LoggerAdapter,
	Module,
	type YabEventMap,
	YabHook,
} from "@yab/core";
import { type AnyClass, type AnyFunction, ensure } from "@yab/utils";
import Memoirist from "memoirist";
import { RouterEvent, type RouterEventMap } from "./event";
import { NotFound } from "./exceptions";
import type { RouterConfig, SlashedPath } from "./interfaces";
import { extractMetadata, handleError, handleResponse } from "./utils";
import { getRouteHandler } from "./utils/getRouteHandler";
import { registerMiddlewares } from "./utils/registerMiddleware";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

type RouteMatch = {
	handler: AnyFunction;
	hooks: Hooks<typeof RouterEvent, RouterEventMap>;
	payload?: {
		query?: TObject;
		body?: TObject;
		params?: TObject;
		headers?: TObject;
	};
	response?: {
		[statusCode: number]: {
			contentType: string;
			schema: TObject;
		};
	};
};

export type RouterOptions = {
	middlewares?: AnyClass<any>[];
};

export class RouterModule extends Module<RouterConfig> {
	#routeMatcher = new Memoirist<RouteMatch>();

	config: RouterConfig;

	@Inject(Hooks)
	hooks!: Hooks<typeof RouterEvent, RouterEventMap>;

	@Logger()
	logger!: LoggerAdapter;

	constructor(
		prefix: SlashedPath,
		controllers: AnyClass<any>[],
		options?: RouterOptions,
	) {
		super();
		ensure(controllers.length > 0, "No controllers provided");
		this.config = {
			middlewares: options?.middlewares,
			routes: {
				[prefix]: controllers.flatMap((controller) =>
					extractMetadata(controller).map((action) => ({
						prefix: action.prefix,
						method: action.method,
						path: action.path,
						controller: controller,
						actionName: action.actionName,
						payload: action.payload,
						response: action.response,
						middlewares: action.middlewares,
					})),
				),
			},
		};
	}

	@YabHook("app:init")
	initRoute({ container }: InitContext) {
		const table: ConsoleTable[] = [];
		for (const [root, routes] of Object.entries(this.config.routes)) {
			for (const route of routes) {
				const {
					prefix,
					method: httpMethod,
					path,
					controller,
					actionName,
					payload,
					response,
					middlewares = [],
				} = route;

				container.registerValue(controller, controller);

				const handler = getRouteHandler(route);

				const hooks = new Hooks<typeof RouterEvent, RouterEventMap>();

				registerMiddlewares(hooks, [
					...(this.config.middlewares || []),
					...middlewares,
				]);

				const method = httpMethod.toLowerCase();
				const routePath = `${root}${prefix}${path}`.replace(/\/$/, "");

				this.#routeMatcher.add(method, routePath, {
					handler,
					payload,
					response,
					hooks,
				});

				table.push({
					method,
					path: routePath,
					handler: handler.name,
				});
			}
		}

		console.table(table);
		this.logger.info(`${table.length} routes initialized`);
	}

	@YabHook("app:request")
	async onRequest(context: Parameters<YabEventMap["app:request"]>[0]) {
		const { request, serverUrl } = context;

		const match = this.#routeMatcher.find(
			request.method.toLowerCase(),
			request.url.replace(serverUrl, "/"),
		);

		if (!match) {
			context.logger.error(`${request.method} ${request.url} not found`);

			return handleError(
				new NotFound(`${request.method} ${request.url} not found`),
			);
		}
		context.logger.info(`${request.method} ${request.url}`);

		const { hooks, handler, response } = match.store;

		try {
			await hooks.invoke(RouterEvent.BeforeRoute, [context]);

			const result = await handler(context);

			await hooks.invoke(RouterEvent.AfterRoute, [context, result]);

			return handleResponse(result, response);
		} catch (error) {
			context.logger.error(
				error as Error,
				`${request.method} ${request.url} failed`,
			);
			return handleError(error as Error);
		}
	}
}
