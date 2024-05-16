import type { HttpMethod } from "../enums";
import type { Parameter, RequestBody, SlashedPath } from "../interfaces";
import { routeStore } from "../stores";

export const Action = (
	method: HttpMethod,
	path: SlashedPath,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
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
					args: parameters,
				},
			);
	};
};
