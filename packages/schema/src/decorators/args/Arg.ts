import { Type } from "@sinclair/typebox";
import type { Parameter } from "@vermi/router";
import { type Class, pascalCase } from "@vermi/utils";
import { guessType, isPrimitive } from "../../utils";

export type ArgOptions = {
	nullable?: boolean;
	name?: string;
	type?: Class<any>;
};

export const Arg = (
	from: Parameter["in"],
	{ nullable = false, name, type }: ArgOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const typeClass =
			type ||
			Reflect.getMetadata("design:paramtypes", target, propertyKey)[
				parameterIndex
			];

		const schema = guessType(typeClass) || Type.Any();

		if (!isPrimitive(typeClass) && !schema.$id) {
			schema.$id = `#/components/schemas/${pascalCase(name ?? typeClass.name)}`;
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
					name: pascalCase(name ?? typeClass.name),
				} satisfies Parameter,
			],
			target,
			propertyKey,
		);
	};
};
