import {
	type Context,
	Hooks,
	type InitContext,
	Inject,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import { type AnyClass, ensure } from "@yab/utils";
import Memoirist from "memoirist";
import { RouterEvent, type RouterEventMap } from "./event";
import { NotFound } from "./exceptions";
import type { RouteMatch, RouterConfig, SlashedPath } from "./interfaces";
import {
	defaultErrorHandler,
	defaultResponseHandler,
	extractMetadata,
	getRouteHandler,
	registerMiddlewares,
} from "./utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

export type RouterOptions = Omit<RouterConfig, "routes">;

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
			errorHandler: options?.errorHandler,
			responseHandler: options?.responseHandler,
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

	#match(request: Request, serverUrl: string) {
		const url = new URL(request.url, serverUrl);
		const match = this.#routeMatcher.find(
			request.method.toLowerCase(),
			url.pathname,
		);

		ensure(match, new NotFound(`${request.method} ${request.url} not found`));

		return match;
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
	async onRequest(context: Context) {
		const { request, serverUrl } = context;
		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
		} = this.config;

		try {
			const match = this.#match(request, serverUrl);

			context.logger.info(`${request.method} ${request.url}`);

			const { hooks, handler, response } = match.store;

			await hooks.invoke(RouterEvent.BeforeRoute, [context]);

			const result = await handler(context);

			await hooks.invoke(RouterEvent.AfterRoute, [context, result]);

			return responseHandler(result, response);
		} catch (error) {
			context.logger.error(
				error as Error,
				`${request.method} ${request.url} failed`,
			);
			return errorHandler(error as Error);
		}
	}
}
