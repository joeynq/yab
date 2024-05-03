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
import { Res, extractMetadata, getMiddlewareMetadata } from "./utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

type RouteMatch = {
	handler: AnyFunction;
	hook: Hooks<typeof RouterEvent, RouterEventMap>;
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

export class RouterModule extends Module<RouterConfig> {
	#routeMatcher = new Memoirist<RouteMatch>();

	config: RouterConfig;

	@Inject(Hooks)
	hooks!: Hooks<typeof RouterEvent, RouterEventMap>;

	@Logger()
	logger!: LoggerAdapter;

	constructor(prefix: SlashedPath, controllers: AnyClass<any>[]) {
		super();
		ensure(controllers.length > 0, "No controllers provided");
		this.config = {
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
		};
	}

	@YabHook("app:init")
	initRoute({ container }: InitContext) {
		const table: ConsoleTable[] = [];
		for (const [root, routes] of Object.entries(this.config)) {
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

				container.registerValue(controller.name, controller);
				const ctrl = container.resolveValue(controller);

				const handler = ctrl[actionName]?.bind(ctrl);

				ensure(
					handler,
					`Method ${actionName} not found in controller ${controller.name}`,
				);

				const hook = new Hooks<typeof RouterEvent, RouterEventMap>();

				for (const middleware of middlewares) {
					const middlewareData = getMiddlewareMetadata(middleware);
					const instance = new middleware();
					for (const [key, value] of Object.entries(
						middlewareData.handler || {},
					)) {
						hook.register(value.event, instance[key].bind(instance));
					}
				}

				const method = httpMethod.toLowerCase();
				const routePath = `${root}${prefix}${path}`.replace(/\/$/, "");
				const handlerName = `${controller.name}.${actionName}`;

				Object.defineProperty(handler, "name", {
					value: handlerName,
					writable: false,
				});

				this.#routeMatcher.add(method, routePath, {
					handler,
					payload,
					response,
					hook,
				});
				table.push({
					method,
					path: routePath,
					handler: handlerName,
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
			return Res.error(
				new NotFound(`${request.method} ${request.url} not found`),
			);
		}
		context.logger.info(`${request.method} ${request.url}`);
		await match.store.hook.invoke(RouterEvent.BeforeRoute, [context]);
		const result = await match.store.handler(context);
		await match.store.hook.invoke(RouterEvent.AfterRoute, [context, result]);

		if (result instanceof Response) {
			return result;
		}

		if (match.store.response?.[204]) {
			return Res.empty();
		}

		const successStatus = 200;
		if (match.store.response?.[201]) {
			const { contentType } = match.store.response[successStatus];
			return Res.created(result, { "Content-Type": contentType });
		}
		if (match.store.response?.[200]) {
			const { contentType } = match.store.response[successStatus];
			return Res.ok(result, { "Content-Type": contentType });
		}

		return Res.ok(result);
	}
}
