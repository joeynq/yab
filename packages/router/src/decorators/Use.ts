import { type HookHandler, HookMetadataKey, mergeMetadata } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { getControllerMetadata, getMiddlewareMetadata } from "../utils";

export const Use = <Middleware extends AnyClass>(
	middleware: Middleware,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getControllerMetadata(target.constructor);
		if (!existing.routes[String(propertyKey)]) {
			throw new Error("Path not found!");
		}

		const router = existing.routes[String(propertyKey)];
		const midMetadata = getMiddlewareMetadata(middleware);
		const hookValue: Record<string, HookHandler[]> = {};

		for (const [key, { event }] of Object.entries(midMetadata.handler)) {
			const eventName = `${event}:${router.method}{prefix}${router.path}`;
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
