import {
	type AppContext,
	AppEvents,
	Config,
	Hook,
	type Hooks,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	type VermiModule,
	asValue,
	hookStore,
	registerProviders,
	saveStoreData,
} from "@vermi/core";
import { type Class, ensure } from "@vermi/utils";
import type { HttpMethod } from "./enums";
import { RouterEvent, type RouterEventMap } from "./event";
import type { RouteMatch, SlashedPath, ValidationFn } from "./interfaces";
import { type CasingType, Router } from "./services";
import { getRoutes, routeStore } from "./stores";
import { defaultErrorHandler, defaultResponseHandler, validate } from "./utils";
import { getConfigFromRequest } from "./utils/getConfigFromRequest";

declare module "@vermi/core" {
	interface _RequestContext {
		route: RouteMatch;
		payload: {
			params?: any;
			query?: any;
			body?: any;
			headers?: any;
			cookies?: any;
		};
	}
}

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
	casing?: {
		interfaces?: CasingType; // query, body, params
		internal?: CasingType;
	};
};

export type RouterModuleConfig = {
	[prefix: SlashedPath]: {
		controllers: Class<any>[];
		options?: RouterOptions;
	};
};

@Module({ deps: [Router] })
export class RouterModule implements VermiModule<RouterModuleConfig> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: RouterModuleConfig;

	constructor(protected router: Router) {}

	#addRoutes(context: AppContext) {
		const routes = getRoutes();
		for (const [path, operation] of routes) {
			const method = path.split("/")[0];
			const route = path.slice(method.length);

			const instance = context.resolve<any>(operation.handler.target.name);
			const action = operation.handler.action;

			this.router.addRoute(method as HttpMethod, route, {
				handler: instance[action].bind(instance),
				path: route,
				args: operation.args,
			});
		}
	}

	#getConfig(): RouterModuleConfig;
	#getConfig(request: Request): RouterOptions & { mount: SlashedPath };
	#getConfig(request?: Request) {
		const config = this.config;

		if (!request) {
			return config;
		}

		return getConfigFromRequest(config, request);
	}

	@Hook(AppEvents.OnInit)
	initRoute(context: AppContext) {
		const mounted = this.#getConfig();

		ensure(mounted, "No configuration provided");

		for (const [prefix, { controllers, options }] of Object.entries(mounted)) {
			ensure(controllers.length > 0, "No controllers provided");
			for (const controller of controllers) {
				routeStore
					.apply(controller)
					.updatePathPrefix({ mount: prefix as SlashedPath });
				hookStore.apply(controller).updateScope({ mount: prefix });
			}
		}

		const all = Object.values(mounted).flatMap((m) => m.controllers);
		registerProviders(...all);

		saveStoreData(routeStore.token, routeStore.combineStore(...all));

		this.#addRoutes(context);
	}

	@Hook("app:request")
	async onRequest(context: RequestContext) {
		this.logger.info(`Request received: ${context.store.request.url}`);
		const config = this.#getConfig(context.store.request);

		if (!config) {
			return;
		}

		const {
			mount,
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation = validate,
		} = config;

		context.register("validator", asValue(customValidation));

		const hooks = context.store.hooks as Hooks<
			typeof RouterEvent,
			RouterEventMap
		>;

		const when = (scope: string) => {
			return scope.startsWith(
				`${context.store.request.method.toLocaleLowerCase()}${mount}`,
			);
		};

		await hooks.invoke(RouterEvent.Init, [context], { when });

		await hooks.invoke(RouterEvent.BeforeRoute, [context], { when });

		const response = await this.router.handleRequest(
			responseHandler,
			errorHandler,
		);

		const newResponse = await hooks.invoke(
			RouterEvent.AfterRoute,
			[context, response],
			{ breakOn: (result) => result instanceof Response, when },
		);

		return newResponse || response;
	}
}
