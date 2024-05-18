import type { Operation } from "@vermi/router";
import { snakeCase } from "@vermi/utils";

export const getNames = (path: string, operation: Operation) => {
	const method = path.split("/")[0];

	const route = path.slice(method.length).replace(/:(\w+)/g, "{$1}");

	return {
		operationId:
			operation.operationId ||
			snakeCase(`${operation.handler.action}_${operation.handler.target.name}`),
		route,
		method,
	};
};
