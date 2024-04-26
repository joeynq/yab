import type { AnyClass } from "@yab/utils";
import type { ControllerMetadata } from "../interfaces";

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
