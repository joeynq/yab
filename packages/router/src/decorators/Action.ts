import { useDecorators } from "@vermi/core";
import type { HttpMethod } from "../enums";
import { ArgsPipingInterceptor } from "../interceptors";
import type {
	Operation,
	Parameter,
	RequestBody,
	SlashedPath,
} from "../interfaces";
import { Casing, Payload, Validator } from "../middlewares";
import { routeStore } from "../stores";
import { Intercept } from "./Intercept";

export const Action = (
	method: HttpMethod,
	path: SlashedPath,
	options?: Pick<Operation, "operationId">,
): MethodDecorator => {
	return useDecorators(
		(target: any, propertyKey: string | symbol) => {
			const parameters = Reflect.getMetadata(
				"design:argtypes",
				target,
				propertyKey,
			) as (Parameter | RequestBody)[];

			routeStore
				.apply(target.constructor)
				.addRoute(
					method,
					`{mount}{prefix}${path.replace(/\/$/, "")}` as SlashedPath,
					propertyKey.toString(),
					{
						args: parameters || [],
						operationId: options?.operationId,
					},
				);
		},
		Intercept(ArgsPipingInterceptor),
		Payload(),
		Casing(),
		Validator(),
	);
};
