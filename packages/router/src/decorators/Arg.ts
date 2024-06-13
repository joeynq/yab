import type { TObject } from "@sinclair/typebox";
import type { Parameter } from "../interfaces";
import { routeStore } from "../stores";

export type ArgOptions = {
	nullable?: boolean;
};

export const Arg = <T extends TObject>(
	from: Parameter["in"],
	schema: T,
	{ nullable = false }: ArgOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		routeStore.apply(target.constructor).addArg(propertyKey, parameterIndex, {
			in: from,
			schema,
			required: !nullable,
			index: parameterIndex,
		});
	};
};
