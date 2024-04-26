import type { TObject } from "@sinclair/typebox";
import {
	Hooks,
	InjectLogger,
	Injectable,
	type Logger,
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

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

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

	@InjectLogger()
	logger!: Logger;

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
				} = route;
				const ctrl = container
					.register(controller.name, asClass(controller))
					.resolveClass(controller);

				const handler = ctrl[actionName]?.bind(ctrl);

				if (!handler) {
					throw new Error(`Method ${actionName} not found`);
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
