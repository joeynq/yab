import { Hooks } from "@yab/core";
import { type AnyClass, deepMerge } from "@yab/utils";
import { RouterEvent, type RouterEventMap } from "../event";
import {
	getControllerMetadata,
	getMiddlewareMetadata,
	setControllerMetadata,
} from "../utils";

export const Use = (middleware: AnyClass): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const middlewareData = getMiddlewareMetadata(middleware);

		const existing = getControllerMetadata(target.constructor);

		if (!existing.routes[String(propertyKey)]) {
			throw new Error("Path not found!");
		}

		const route = existing.routes[String(propertyKey)];
		const hook = route.hook || new Hooks<typeof RouterEvent, RouterEventMap>();

		const middlewareInstance = new middleware() as any;
		for (const [key, value] of Object.entries(middlewareData.handler || {})) {
			if (value.event === RouterEvent.BeforeRoute) {
				hook.register(RouterEvent.BeforeRoute, middlewareInstance[key]);
			}
			if (value.event === RouterEvent.AfterRoute) {
				hook.register(RouterEvent.AfterRoute, middlewareInstance[key]);
			}
		}

		const merged = deepMerge(existing, {
			routes: {
				[propertyKey.toString()]: {
					hook,
				},
			},
		});

		setControllerMetadata(target.constructor, merged);
	};
};
