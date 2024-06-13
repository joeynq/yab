import { Type } from "@sinclair/typebox";
import { type Parameter, routeStore } from "@vermi/router";
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

		routeStore.apply(target.constructor).addArg(propertyKey, parameterIndex, {
			in: from,
			schema,
			required: !nullable,
			index: parameterIndex,
			name: pascalCase(name ?? typeClass.name),
		});
	};
};
