import { Type } from "@sinclair/typebox";
import type { Parameter } from "@vermi/router";
import { isPrimitive } from "../../utils";
import { SchemaKey } from "../Model";

export type ArgOptions = {
	nullable?: boolean;
};

export const Arg = (
	from: Parameter["in"],
	{ nullable = false }: ArgOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const typeClass = Reflect.getMetadata(
			"design:paramtypes",
			target,
			propertyKey,
		)[parameterIndex];

		const schema = typeClass[SchemaKey] || Type.Any();

		if (!isPrimitive(typeClass)) {
			schema.$id = `#/components/schemas/${typeClass.name}`;
		}

		Reflect.defineMetadata(
			"design:argtypes",
			[
				...(Reflect.getMetadata("design:argtypes", target, propertyKey) || []),
				{
					in: from,
					schema,
					required: !nullable,
					index: parameterIndex,
					name: typeClass.name,
				} satisfies Parameter,
			],
			target,
			propertyKey,
		);
	};
};
