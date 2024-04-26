import type { TObject } from "@sinclair/typebox";
import {
	Hooks,
	Injectable,
	Module,
	type YabEventMap,
	YabHook,
} from "@yab/core";
import type { AnyClass, AnyFunction } from "@yab/utils";
import { asClass } from "awilix";
import Memoirist from "memoirist";
import type { RouterEvent, RouterEventMap } from "./event";
import { NotFound } from "./exceptions";
import type { RouteObject, RouterConfig, SlashedPath } from "./interfaces";
import { Res, getControllerMetadata } from "./utils";

type RouteMatch = {
	handler: AnyFunction;
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

@Injectable()
export class RouterModule extends Module<RouterConfig> {
	#routeMatcher = new Memoirist<RouteMatch>();

	config: RouterConfig;
	hooks = new Hooks<typeof RouterEvent, RouterEventMap>();

	constructor(prefix: SlashedPath, controllers: AnyClass<any>[]) {
		super();
		if (!controllers.length) {
			throw new Error("No controllers provided");
		}
		this.config = {
			[prefix]: controllers.flatMap((controller) =>
				this.#extractMetadata(controller).map((action) => ({
					prefix: action.prefix,
					method: action.method,
					path: action.path,
					controller: controller,
					actionName: action.actionName,
					payload: action.payload,
					response: action.response,
				})),
			),
		};
	}

	#extractMetadata(controller: AnyClass): RouteObject[] {
		const metadata = getControllerMetadata(controller);
		if (!metadata) {
			throw new Error("Controller metadata not found");
		}
		return Object.entries(metadata.routes).map(([actionName, route]) => ({
			controller: metadata.controller,
			prefix: metadata.prefix,
			method: route.method,
			path: route.path,
			actionName,
			payload: route.payload,
			response: route.response,
		}));
	}

	@YabHook("app:init")
	initRoute({ container }: Parameters<YabEventMap["app:init"]>[0]) {
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
				} = route;
				const ctrl = container
					.register(controller.name, asClass(controller))
					.resolveClass(controller);

				const method = httpMethod.toLowerCase();
				const routePath = `${root}${prefix}${path}`;
				const handler = ctrl[actionName].bind(controller);

				if (!handler) {
					throw new Error(`Method ${actionName} not found`);
				}
				this.#routeMatcher.add(method, routePath, {
					handler,
					payload,
					response,
				});
			}
		}
	}

	@YabHook("app:request")
	async onRequest(context: Parameters<YabEventMap["app:request"]>[0]) {
		const { request } = context;
		const match = this.#routeMatcher.find(
			request.method.toLowerCase(),
			request.url,
		);

		if (!match) {
			return Res.error(
				new NotFound(`${request.method} ${request.url} not found`),
			);
		}

		// to do, run all beforeRoute hooks

		const result = await match.store.handler(context);

		// to do, run all afterRoute hooks

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
