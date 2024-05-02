import { type AnyClass, ensure } from "@yab/utils";
import type { ControllerMetadata, RouteObject } from "../interfaces";

export const RouteMetadataKey = Symbol("Router:Routes");

export const getControllerMetadata = (controller: AnyClass) => {
	return Reflect.getMetadata(
		RouteMetadataKey,
		controller,
	) as ControllerMetadata;
};

export const setControllerMetadata = (
	controller: AnyClass,
	metadata: ControllerMetadata,
) => {
	Reflect.defineMetadata(RouteMetadataKey, metadata, controller);
};

export const extractMetadata = (controller: AnyClass): RouteObject[] => {
	const metadata = getControllerMetadata(controller);

	ensure(metadata, `Controller metadata not found for ${controller.name}`);

	return Object.entries(metadata.routes).map(([actionName, route]) => ({
		controller: metadata.controller,
		prefix: metadata.prefix,
		method: route.method,
		path: route.path,
		actionName,
		payload: route.payload,
		response: route.response,
		middlewares: route.middlewares,
	}));
};
