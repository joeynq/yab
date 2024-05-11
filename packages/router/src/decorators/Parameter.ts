import type { TObject } from "@sinclair/typebox";
import { type AnyClass, deepMerge } from "@vermi/utils";
import type {
	ControllerMetadata,
	ParameterType,
	RouteParameter,
} from "../interfaces";
import type { Mapper } from "../services";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Parameter = <T extends TObject>(
	from: ParameterType,
	schema: T,
	...pipes: Array<AnyClass<Mapper>>
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const existing = getControllerMetadata(target.constructor) || {};
		const methodArgument: RouteParameter = {
			index: parameterIndex,
			in: from,
			schema,
			pipes,
		};

		const merged = deepMerge(existing, {
			routes: {
				[propertyKey.toString()]: {
					parameters: [methodArgument],
				},
			},
		}) as ControllerMetadata;

		setControllerMetadata(target.constructor, merged);
	};
};
