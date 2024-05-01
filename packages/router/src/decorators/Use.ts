import { Hooks } from "@yab/core";
import { type AnyClass, deepMerge } from "@yab/utils";
import type { RouterEvent, RouterEventMap } from "../event";
import {
	getControllerMetadata,
	getMiddlewareMetadata,
	setControllerMetadata,
} from "../utils";

export const Use = (middleware: AnyClass<any>): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const middlewareData = getMiddlewareMetadata(middleware);

		const existing = getControllerMetadata(target.constructor);

		if (!existing.routes[String(propertyKey)]) {
			throw new Error("Path not found!");
		}

		const route = existing.routes[String(propertyKey)];
		const hook = route.hook || new Hooks<typeof RouterEvent, RouterEventMap>();

		const instance = new middleware();
		for (const [key, value] of Object.entries(middlewareData.handler || {})) {
			hook.register(value.event, instance[key].bind(instance));
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
