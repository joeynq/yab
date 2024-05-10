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
import type { RouterConfig, SlashedPath } from "./interfaces";
import { Router } from "./services/Router";
import {
	defaultErrorHandler,
	defaultResponseHandler,
	extractMetadata,
} from "./utils";

export type RouterOptions = Omit<RouterConfig, "routes">;

@Module()
export class RouterModule extends YabModule<RouterConfig> {
	// #routeMatcher = new Memoirist<RouteMatch>();
	#router = new Router();

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
						return { ...action, controller };
					}),
				),
			},
		};
	}

	@YabHook("app:init")
	initRoute(context: AppContext) {
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
				const { controller } = route;

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

				this.#router.addRouteFromController(instance, route, root);

				console.table(this.#router.debug);
				this.logger.info(`${this.#router.debug.length} routes initialized`);
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
	}

	@YabHook("app:request")
	async onRequest(context: RequestContext) {
		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation,
		} = this.config;

		this.#router.useContext(context);
		customValidation && this.#router.useValidator(customValidation);

		return await this.#router.handleRequest(responseHandler, errorHandler);
	}
}
