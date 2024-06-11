import {
	type AppContext,
	AppEvents,
	Config,
	Hook,
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
import { RouterEvent } from "./event";
import type {
	HTTPMethod,
	RouteMatch,
	SlashedPath,
	ValidationFn,
} from "./interfaces";
import { type CasingType, Router } from "./services";
import { getRoutes, routeStore } from "./stores";
import { defaultErrorHandler, defaultResponseHandler, validate } from "./utils";

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
			const route = path.slice(method.length) || "/";

			const instance = context.resolve<any>(operation.handler.target.name);
			const action = operation.handler.action;

			this.router.addRoute(method as HTTPMethod, route, {
				handler: (...args: any) => instance[action](...args),
				path: route,
				args: operation.args,
				mount: operation.mount || "/",
			});
		}
	}

	@Hook(AppEvents.OnInit)
	initRoute(context: AppContext) {
		const mounted = this.config;

		ensure(mounted, "No configuration provided");

		for (const [mount, { controllers }] of Object.entries(mounted)) {
			ensure(controllers.length > 0, "No controllers provided");
			for (const controller of controllers) {
				routeStore
					.apply(controller)
					.updatePathPrefix({ mount: mount as SlashedPath });
				hookStore.apply(controller).updateScope({ mount });
			}
		}

		const all = Object.values(mounted).flatMap((m) => m.controllers);
		registerProviders(...all);

		saveStoreData(routeStore.token, routeStore.combineStore(...all));

		this.#addRoutes(context);
	}

	@Hook("app:request")
	async onRequest(context: RequestContext) {
		const match = await this.router.match();
		if (!match) {
			return;
		}

		const mount = match.store.mount;
		ensure(mount, "No mount found for route");

		const config = this.config[mount as keyof RouterModuleConfig];

		if (!config) {
			return;
		}

		const {
			errorHandler = defaultErrorHandler,
			responseHandler = defaultResponseHandler,
			customValidation = validate,
		} = config.options || {};
		const { request, logger, hooks } = context.store;
		const { responses } = match.store;

		try {
			this.logger.info(`Request received: ${context.store.request.url}`);

			context.register("validator", asValue(customValidation));

			const invoke = async (
				event: RouterEvent,
				...data: any[]
			): Promise<Response | undefined> => {
				const response = await hooks.invoke(event, data, {
					when: (scope: string) => {
						return scope.startsWith(`${request.method.toUpperCase()}${mount}`);
					},
					breakOn: (result: any | undefined) => result instanceof Response,
				});

				if (response instanceof Response) {
					return responseHandler(response, responses);
				}
			};

			let response: Response | undefined = undefined;

			response = await invoke(RouterEvent.Match, context);
			if (response) return response;

			response = await invoke(RouterEvent.BeforeRoute, context);
			if (response) return response;

			const result = await this.router.handleRequest();

			response = await invoke(RouterEvent.AfterRoute, context, result);

			return response ?? responseHandler(result, responses);
		} catch (err) {
			const error = err as Error;
			logger.error(error, `${request.method} ${request.url} failed`);
			return errorHandler(error, responses);
		}
	}
}
