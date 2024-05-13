import type { TObject } from "@sinclair/typebox";
import type { Parameter } from "../interfaces";

export type ArgOptions = {
	nullable?: boolean;
};

export const Arg = <T extends TObject>(
	from: Parameter["in"],
	schema: T,
	{ nullable = false }: ArgOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		Reflect.defineMetadata(
			"design:argtypes",
			[
				...(Reflect.getMetadata("design:argtypes", target, propertyKey) || []),
				{
					in: from,
					schema,
					required: !nullable,
					index: parameterIndex,
				} satisfies Parameter,
			],
			target,
			propertyKey,
		);
	};
};
