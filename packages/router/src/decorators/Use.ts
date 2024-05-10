import { type HookHandler, HookMetadataKey, mergeMetadata } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import {
	getControllerMetadata,
	getMiddlewareMetadata,
	getRequestScope,
} from "../utils";

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
			hookValue[event] = [
				{
					target: middleware,
					method: key,
					scope: getRequestScope(method, `{prefix}${path}`),
				},
			];
		}
		mergeMetadata(HookMetadataKey, hookValue, target.constructor.prototype);
	};
};
