import type { TObject } from "@sinclair/typebox";
import { deepMerge } from "@yab/utils";
import type {
	ControllerMetadata,
	ParameterType,
	RouteParameter,
} from "../interfaces";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Parameter = <T extends TObject>(
	from: ParameterType,
	schema?: T,
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const existing = getControllerMetadata(target.constructor) || {};
		const methodArgument: RouteParameter = {
			index: parameterIndex,
			in: from,
			schema,
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
