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
	asValue,
	hookStore,
	saveStoreData,
} from "@vermi/core";
import {
	type Class,
	ensure,
	getCookies,
	parseQuery,
	pathname,
	stringify,
} from "@vermi/utils";
import type { HttpMethod } from "./enums";
import { RouterEvent, type RouterEventMap } from "./event";
import type { RouteMatch, SlashedPath, ValidationFn } from "./interfaces";
import { type CasingType, Router, casingFactory } from "./services";
import { getRoutes, routeStore } from "./stores";
import { defaultErrorHandler, defaultResponseHandler } from "./utils";

declare module "@vermi/core" {
	interface _RequestContext {
		payload: {
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

	#addRoutes(instanceMap: Record<string, any>) {
		const routes = getRoutes();
		for (const [path, operation] of routes) {
			const method = path.split("/")[0];
			const route = path.slice(method.length);

			const instance = instanceMap[operation.handler.target.name];
			const action = operation.handler.action;

			this.#router.addRoute(method as HttpMethod, route, {
				handler: instance[action].bind(instance),
				path: route,
				args: operation.args,
			});
		}
	}

	#getConfig(): RouterModuleConfig;
	#getConfig(request: Request): RouterOptions & { mount: SlashedPath };
	#getConfig(request?: Request) {
		const config = this.getConfig();

		if (!request) {
			return config;
		}

		const path = pathname(request.url).split("/")[1];
		const mount = `/${path}` as SlashedPath;

		if (!config[mount]) {
			return;
		}

		return { ...config[mount], mount };
	}

	async #payloadCasing(casing: CasingType, context: RequestContext) {
		const service = casingFactory(casing);
		const { request } = context.store;

		const query = parseQuery(request.url) || undefined;

		const body = await request.text();

		const headers = Object.fromEntries(request.headers);

		const cookies = getCookies(request.headers.get("cookie") || "");

		context.register(
			"payload",
			asValue({
				query: query ? service.convert(query) : undefined,
				body: body ? service.convert(JSON.parse(body)) : undefined,
				headers: service.convert(headers),
				cookies: service.convert(cookies),
			}),
		);
	}

	async #responseCasing(
		casing: CasingType,
		_: RequestContext,
		response: Response,
	) {
		const service = casingFactory(casing);

		const body = await response.json();

		return new Response(stringify(service.convert(body as object)), {
			status: response.status,
			headers: response.headers,
		});
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

			const { interfaces, internal = "camel" } = options?.casing || {};

			if (interfaces && internal && interfaces !== internal) {
				context.store.hooks.register(RouterEvent.BeforeRoute, {
					handler: this.#payloadCasing.bind(this, internal),
					scope: prefix,
				});
				context.store.hooks.register(RouterEvent.AfterRoute, {
					handler: this.#responseCasing.bind(this, interfaces),
					scope: prefix,
				});
			}
		}

		const all = Object.values(mounted).flatMap((m) => m.controllers);
		const instanceMap = context.registerServices(...all);
		saveStoreData(routeStore.token, routeStore.combineStore(...all));

		this.#addRoutes(instanceMap);
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

		await hooks.invoke(RouterEvent.BeforeRoute, [context], { scope: mount });

		const response = await this.#router.handleRequest(
			responseHandler,
			errorHandler,
		);

		const newResponse = await hooks.invoke(
			RouterEvent.AfterRoute,
			[context, response],
			{ breakOn: (result) => result instanceof Response, scope: mount },
		);

		return newResponse;
	}
}
