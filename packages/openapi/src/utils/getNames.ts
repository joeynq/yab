import type { Operation } from "@vermi/router";
import { pascalCase } from "@vermi/utils";

export const getNames = (path: string, operation: Operation) => {
	const method = path.split("/")[0];

	const route = path.slice(method.length).replace(/:(\w+)/g, "{$1}");

	const controllerName = operation.handler.target.name
		.replace("Controller", "")
		.replace("controller", "")
		.replace("Ctrl", "");

	const operationId = pascalCase(
		`${controllerName}_${operation.handler.action}`,
	);

	return {
		operationId,
		route,
		method,
	};
};
