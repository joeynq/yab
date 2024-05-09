import { type HookHandler, HookMetadataKey, mergeMetadata } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { RouterEvent } from "../event";
import {
	getControllerMetadata,
	getEventName,
	getMiddlewareMetadata,
} from "../utils";

const routeSpecificEvents = [RouterEvent.BeforeHandle, RouterEvent.AfterHandle];

export const Use = <Middleware extends AnyClass>(
	middleware: Middleware,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getControllerMetadata(target.constructor);
		if (!existing.routes[String(propertyKey)]) {
			throw new Error("Path not found!");
		}

		const { method, path } = existing.routes[String(propertyKey)];
		const midMetadata = getMiddlewareMetadata(middleware);
		const hookValue: Record<string, HookHandler[]> = {};

		for (const [key, { event }] of Object.entries(midMetadata.handler)) {
			const eventName = routeSpecificEvents.includes(event)
				? getEventName(event, method, `{prefix}${path}`)
				: event;
			hookValue[eventName] = [
				{
					target: middleware,
					method: key,
					scoped: "request",
				},
			];
		}
		mergeMetadata(HookMetadataKey, hookValue, target.constructor.prototype);
	};
};
