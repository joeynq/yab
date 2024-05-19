import { Type } from "@sinclair/typebox";
import type { HttpMethod } from "../enums";
import type {
	Operation,
	Parameter,
	RequestBody,
	SlashedPath,
} from "../interfaces";
import { routeStore } from "../stores";

export const Action = (
	method: HttpMethod,
	path: SlashedPath,
	options?: Pick<Operation, "operationId">,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const parameters =
			(Reflect.getMetadata("design:argtypes", target, propertyKey) as (
				| Parameter
				| RequestBody
			)[]) || [];

		const pathParameters = path.match(/:(\w+)/g) || [];
		for (const pathParam of pathParameters) {
			const name = pathParam.slice(1);
			const parameter = parameters.find((param) => param.name === name);
			if (!parameter) {
				parameters.push({
					name,
					in: "path",
					required: true,
					schema: Type.String({ maxLength: 32 }),
				});
			}
		}

		routeStore
			.apply(target.constructor)
			.addRoute(
				method,
				`{mount}{prefix}${path.replace(/\/$/, "")}` as SlashedPath,
				propertyKey.toString(),
				{
					args: parameters,
					operationId: options?.operationId,
				},
			);
	};
};
