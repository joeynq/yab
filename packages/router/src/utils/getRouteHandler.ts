import { resolveValue } from "@yab/core";
import { ensure } from "@yab/utils";
import type { RouteObject } from "../interfaces";

export const getRouteHandler = (route: RouteObject) => {
	const { controller, actionName } = route;

	const ctrl = resolveValue(controller);

	const handler = ctrl[actionName]?.bind(ctrl);

	ensure(
		handler,
		`Method ${actionName} not found in controller ${controller.name}`,
	);

	const handlerName = `${controller.name}.${actionName}`;

	Object.defineProperty(handler, "name", {
		value: handlerName,
		writable: false,
	});

	return handler;
};
