import {
	type AppContext,
	type HookHandler,
	HookMetadataKey,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	YabHook,
	YabModule,
	asClass,
} from "@yab/core";
import { type AnyClass, type Dictionary, ensure } from "@yab/utils";
import Memoirist from "memoirist";
import { RouterEvent } from "./event";
import { NotFound } from "./exceptions";
import type { RouteMatch, RouterConfig, SlashedPath } from "./interfaces";
import {
	defaultErrorHandler,
	defaultResponseHandler,
	extractMetadata,
	getEventName,
	getRequestPayload,
	getRouteHandler,
	validate,
} from "./utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

export type RouterOptions = Omit<RouterConfig, "routes">;

@Module()
export class RouterModule extends YabModule<RouterConfig> {
	#routeMatcher = new Memoirist<RouteMatch>();

	config: RouterConfig;

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
			...options,
			routes: {
				[prefix]: controllers.flatMap((controller) =>
					extractMetadata(controller).map((action) => {
						return {
							prefix: action.prefix,
							method: action.method,
							path: action.path,
							controller: controller,
							actionName: action.actionName,
							response: action.response,
							parameters: action.parameters,
						};
					}),
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
	initRoute(context: AppContext) {
		const table: ConsoleTable[] = [];

		const registering: Record<
			string,
			{
				resolver: ReturnType<typeof asClass>;
				instance: any;
			}
		> = {};

		for (const mid of this.config.middlewares || []) {
			const midResolver = asClass(mid).singleton();
			registering[mid.name] = {
				resolver: midResolver,
				instance: context.build(midResolver),
			};
		}

		for (const [root, routes] of Object.entries(this.config.routes)) {
			for (const route of routes) {
				const { prefix, method: httpMethod, path, controller } = route;

				const method = httpMethod.toLowerCase();
				const routePath = `${root}${prefix}${path}`.replace(/\/$/, "");

				let instance: any;

				if (registering[controller.name]) {
					instance = registering[controller.name].instance;
				} else {
					const resolver = asClass(controller).singleton();
					instance = context.build(resolver);

					registering[controller.name] = { resolver, instance };

					const hooks = Reflect.getMetadata(
						HookMetadataKey,
						instance,
					) as Dictionary<HookHandler[]>;

					if (hooks) {
						for (const handlers of Object.values(hooks)) {
							for (const { target } of handlers) {
								if (target) {
									const resolver = asClass(target).scoped();
									registering[target.name] = {
										resolver: resolver,
										instance: context.build(resolver),
									};
								}
							}
						}
					}
				}

				const handler = getRouteHandler(instance, route);

				this.#routeMatcher.add(method, routePath, {
					handler,
					response: route.response,
					path,
					parameters: route.parameters,
					prefix,
				});

				table.push({
					method,
					path: routePath,
					handler: handler.name,
				});
			}
		}

		context.register(
			Object.keys(registering).reduce(
				(acc, key) => {
					acc[key] = registering[key].resolver;
					return acc;
				},
				{} as Record<string, ReturnType<typeof asClass>>,
			),
		);

		for (const { instance } of Object.values(registering)) {
			context.store.hooks.registerFromMetadata(instance);
		}

		console.table(table);
		this.logger.info(`${table.length} routes initialized`);
	}

	@YabHook("app:request")
	async onRequest(context: RequestContext) {
		const { request, serverUrl, logger } = context.store;
		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation,
		} = this.config;

		try {
			logger.info(`Incoming request: ${request.method} ${request.url}`);

			const match = this.#match(request, serverUrl);
			logger.info(`${request.method} ${request.url}`);

			await context.store.hooks.invoke(RouterEvent.Init, [context]);

			await context.store.hooks.invoke(RouterEvent.BeforeRoute, [context]);

			const { handler, response, path, prefix } = match.store;

			const args = await getRequestPayload(request, match);

			const validator = customValidation || validate;

			for (const arg of args) {
				if (arg.schema) {
					validator(arg.schema, arg.payload, match);
				}
			}

			const relativePath = `${prefix}${path}`.replace(/\/$/, "");

			await context.store.hooks.invoke(
				getEventName(RouterEvent.BeforeHandle, request.method, relativePath),
				[context],
			);

			const result = await handler(...args.map((el) => el.payload));
			await context.store.hooks.invoke(
				getEventName(RouterEvent.AfterHandle, request.method, relativePath),
				[context],
			);

			return responseHandler(result, response);
		} catch (error) {
			logger.error(error as Error, `${request.method} ${request.url} failed`);
			return errorHandler(error as Error);
		}
	}
}
