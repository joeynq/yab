import type { AnyClass } from "@vermi/utils";
import type { RouterEvent } from "../event";

type HandlerMetadata = {
	order?: number;
	event: RouterEvent;
};

export type MiddlewareMetadata = {
	target: AnyClass<any>;
	handler: {
		[propertyKey: string]: HandlerMetadata;
	};
};

export const MiddlewareMetadataKey = Symbol("middleware:handler");

export const getMiddlewareMetadata = (target: AnyClass) => {
	return Reflect.getMetadata(
		MiddlewareMetadataKey,
		target,
	) as MiddlewareMetadata;
};

export const setMiddlewareMetadata = (
	target: AnyClass,
	metadata: MiddlewareMetadata,
) => {
	Reflect.defineMetadata(MiddlewareMetadataKey, metadata, target);
};

export const getRequestScope = (method: string, path: string) => {
	return `${method}${path}`.replace(/\/$/, "").toLowerCase();
};
