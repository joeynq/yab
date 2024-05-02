import type { TSchema } from "@sinclair/typebox";
import {
	type AppContext,
	Hooks,
	HttpException,
	Inject,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	type YabEventMap,
	type YabEvents,
	YabHook,
	YabModule,
	asClass,
} from "@yab/core";
import { type AnyClass, ensure } from "@yab/utils";
import Memoirist from "memoirist";
import { RouterEvent, type RouterEventMap } from "./event";
import { BadRequest, NotFound, ValidationError } from "./exceptions";
import type { RouteMatch, RouterConfig, SlashedPath } from "./interfaces";
import {
	defaultErrorHandler,
	defaultResponseHandler,
	extractMetadata,
	getRouteHandler,
} from "./utils";
import {
	getPayloadRequest,
	validatePayloadRequest,
} from "./utils/handlePayloadRequest";

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

	@Inject(Hooks)
	hooks!: Hooks<typeof YabEvents, YabEventMap>;

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
			customValidation: async (schema: TSchema, value: unknown) => {
				const validate = options?.customValidation || validatePayloadRequest;
				try {
					await validate(schema, value);
				} catch (e) {
					if (e instanceof HttpException) {
						// if users want to throw HttpRequest, let them do it
						throw e;
					}
					if (e instanceof ValidationError) {
						throw new BadRequest(e.message, e.toJSON().errors);
					}
					throw new BadRequest((e as Error).message);
				}
			},
			routes: {
				[prefix]: controllers.flatMap((controller) =>
					extractMetadata(controller).map((action) => {
						return {
							prefix: action.prefix,
							method: action.method,
							path: action.path,
							controller: controller,
							actionName: action.actionName,
							payload: action.payload,
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
		const registeringMiddlewares: Record<
			string,
			ReturnType<typeof asClass>
		> = {};

		for (const mid of this.config.middlewares || []) {
			const midResolver = asClass(mid).transient();
			registeringMiddlewares[mid.name] = midResolver;
		}

		context.register(registeringMiddlewares);

		const registering: Record<
			string,
			{
				resolver: ReturnType<typeof asClass>;
				instance: any;
			}
		> = {};
		const hooks =
			context.resolve<Hooks<{ [x: string]: any }, RouterEventMap>>("hooks");

		for (const [root, routes] of Object.entries(this.config.routes)) {
			for (const route of routes) {
				const {
					prefix,
					method: httpMethod,
					path,
					controller,
					payload,
					response,
				} = route;

				const method = httpMethod.toLowerCase();
				const routePath = `${root}${prefix}${path}`.replace(/\/$/, "");

				let instance: any;

				if (registering[controller.name]) {
					instance = registering[controller.name].instance;
				} else {
					const resolver = asClass(controller);
					instance = context.build(resolver);

					registering[controller.name] = { resolver, instance };
				}
				const handler = getRouteHandler(instance, route);

				this.#routeMatcher.add(method, routePath, {
					handler,
					payload,
					response,
					hooks,
					path,
					route,
				});

				table.push({
					method,
					path: routePath,
					handler: handler.name,
				});
			}
		}

		for (const { instance } of Object.values(registering)) {
			context.store.hooks.registerFromMetadata(instance);
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

		console.table(table);
		this.logger.info(`${table.length} routes initialized`);
	}

	@YabHook("app:request")
	async onRequest(context: RequestContext) {
		const { request, serverUrl, logger, hooks } = context.store;
		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation,
		} = this.config;

		try {
			logger.info(`Incoming request: ${request.method} ${request.url}`);

			const match = this.#match(request, serverUrl);
			logger.info(`${request.method} ${request.url}`);

			const {
				handler,
				response,
				path,
				route: { prefix },
			} = match.store;

			const args = getPayloadRequest(request, match);
			if (customValidation) {
				for (const arg of args) {
					if (arg.schema) {
						customValidation(arg.schema, arg.payload);
					}
				}
			}
			const relativePath = `${prefix}${path}`.replace(/\/$/, "");
			const beforeRouteName = `${RouterEvent.BeforeRoute}:${request.method}${relativePath}`;
			const afterRouteName = `${RouterEvent.AfterRoute}:${request.method}${relativePath}`;

			await hooks.invoke(RouterEvent.Init, [context]);
			await hooks.invoke(beforeRouteName as any, [context]);

			const result = await handler(...args.map((el) => el.payload));
			await hooks.invoke(afterRouteName as any, [context]);

			return responseHandler(result, response);
		} catch (error) {
			logger.error(error as Error, `${request.method} ${request.url} failed`);
			return errorHandler(error as Error);
		}
	}
}
