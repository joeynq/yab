import type { AnyClass } from "@yab/utils";
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

export const MiddlewreMetadataKey = Symbol("middleware:handler");

export const getMiddlewareMetadata = (middilewareClass: AnyClass) => {
	return Reflect.getMetadata(
		MiddlewreMetadataKey,
		middilewareClass,
	) as MiddlewareMetadata;
};

export const setMiddlewareMetadata = (
	middilewareClass: AnyClass,
	metadata: MiddlewareMetadata,
) => {
	Reflect.defineMetadata(MiddlewreMetadataKey, metadata, middilewareClass);
};
