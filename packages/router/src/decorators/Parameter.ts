import type { TObject, TProperties } from "@sinclair/typebox";
import { deepMerge } from "@yab/utils";
import type { ParameterType, RouteParameter } from "../interfaces";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Parameter = <T extends TProperties>(
	intype: ParameterType,
	schema?: TObject<T>,
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const existing = getControllerMetadata(target.constructor) || {};
		const methodArgument: RouteParameter = {
			index: parameterIndex,
			in: intype,
			schema,
		};

		const merged = deepMerge(existing, {
			routes: {
				[propertyKey.toString()]: {
					parameters: [methodArgument],
				},
			},
		});

		setControllerMetadata(target.constructor, merged);
	};
};
