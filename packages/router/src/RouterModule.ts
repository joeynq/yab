import {
	type AppContext,
	AppEvents,
	type Configuration,
	Hook,
	type Hooks,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	asClass,
	dependentStore,
	hookStore,
	saveStoreData,
} from "@vermi/core";
import { type Class, ensure } from "@vermi/utils";
import type { HttpMethod } from "./enums";
import { RouterEvent, type RouterEventMap } from "./event";
import type {
	RouteMatch,
	Routes,
	SlashedPath,
	ValidationFn,
} from "./interfaces";
import { Router } from "./services";
import { routeStore } from "./stores";
import { defaultErrorHandler, defaultResponseHandler } from "./utils";

export type RouterOptions = {
	middlewares?: Class<any>[];
	customValidation?: ValidationFn;
	errorHandler?: (
		error: Error,
		responses?: RouteMatch["responses"],
	) => Response;
	responseHandler?: <T>(
		result: T,
		responses?: RouteMatch["responses"],
	) => Response;
};

export type RouterModuleConfig = {
	[prefix: SlashedPath]: {
		controllers: Class<any>[];
		options?: RouterOptions;
	};
};

@Module()
export class RouterModule extends VermiModule<RouterModuleConfig> {
	#router = new Router();

	constructor(
		protected configuration: Configuration,
		private logger: LoggerAdapter,
		private hooks: Hooks<typeof RouterEvent, RouterEventMap>,
	) {
		super();
	}

	#addRoutes(instance: any, routes: Routes["paths"]) {
		for (const [path, operation] of routes) {
			const method = path.split("/")[0];
			const route = path.slice(method.length);

			this.#router.addRoute(method as HttpMethod, route, {
				handler: instance[operation.handler.action].bind(instance),
				path: route,
				args: operation.args,
			});
		}
	}

	#getConfig(): RouterModuleConfig;
	#getConfig(request: Request): RouterOptions;
	#getConfig(request?: Request) {
		const config = this.getConfig();

		if (!request) {
			return config;
		}

		const path = new URL(request.url).pathname.split("/")[1];
		const mount = `/${path}` as SlashedPath;

		return config[mount];
	}

	@Hook(AppEvents.OnInit)
	initRoute(context: AppContext) {
		const mounted = this.#getConfig();

		ensure(mounted, "No configuration provided");

		const registering: Record<string, ReturnType<typeof asClass>> = {};

		let hookEvents: ReturnType<typeof hookStore.combineStore> = new Map();
		let dependents: Class<any>[] = [];
		for (const [prefix, { controllers }] of Object.entries(mounted)) {
			ensure(controllers.length > 0, "No controllers provided");

			for (const controller of controllers) {
				const routes = routeStore
					.apply(controller)
					.updatePathPrefix({ mount: prefix as SlashedPath });
				const resolver = asClass(controller);
				const instance = context.build(resolver);

				registering[controller.name] = resolver;

				routes && this.#addRoutes(instance, routes);
				hookStore.apply(controller).updateScope({ mount: prefix });
			}

			hookEvents = hookStore.combineStore(...controllers);
			dependents = dependentStore.combineStore(...controllers) || [];

			saveStoreData(routeStore.token, routeStore.combineStore(...controllers));
		}

		for (const dependent of dependents) {
			registering[dependent.name] = asClass(dependent);
		}

		context.register(registering);

		console.table(this.#router.debug);
		this.logger.info(`${this.#router.debug.length} routes registered`);

		if (hookEvents) {
			for (const [event, handlers] of hookEvents.entries()) {
				for (const { target, handler, scope } of handlers) {
					this.hooks.register(event as any, {
						target: target,
						handler: handler,
						scope,
					});
				}
			}
		}
	}

	@Hook("app:request")
	async onRequest(context: RequestContext) {
		this.logger.info(`Request received: ${context.store.request.url}`);
		const config = this.#getConfig(context.store.request);

		if (!config) {
			return;
		}

		const {
			customValidation,
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
		} = config;

		this.#router.useContext(context);
		customValidation && this.#router.useValidator(customValidation);

		const hooks = context.store.hooks as Hooks<
			typeof RouterEvent,
			RouterEventMap,
			RequestContext
		>;

		await hooks.invoke(RouterEvent.Init, [context]);

		await hooks.invoke(RouterEvent.BeforeRoute, [context]);

		const response = await this.#router.handleRequest(
			responseHandler,
			errorHandler,
		);

		await hooks.invoke(RouterEvent.AfterRoute, [context]);

		return response;
	}
}
