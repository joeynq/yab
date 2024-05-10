import { ensure } from "@vermi/utils";
import type { RouteObject } from "../interfaces";

export const getRouteHandler = (
	ctrl: InstanceType<any>,
	route: RouteObject,
) => {
	const { actionName } = route;

	const handler = ctrl[actionName]?.bind(ctrl);

	ensure(
		handler,
		`Method ${actionName} not found in controller ${ctrl.constructor.name}`,
	);

	const handlerName = `${ctrl.constructor.name}.${actionName}`;

	Object.defineProperty(handler, "name", {
		value: handlerName,
		writable: false,
	});

	return handler;
};
