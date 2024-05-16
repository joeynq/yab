import { Type } from "@sinclair/typebox";
import type { BodyOptions, RequestBody } from "@vermi/router";
import { isPrimitive } from "../../utils";
import { SchemaKey } from "../Model";

export const Body = ({
	nullable = false,
	contentType = "application/json",
}: BodyOptions = {}) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const typeClass = Reflect.getMetadata(
			"design:paramtypes",
			target,
			propertyKey,
		)[parameterIndex];

		const schema = typeClass[SchemaKey] || Type.Any();

		if (isPrimitive(typeClass)) {
			schema.$id = `#/components/schemas/${typeClass.name}`;
		}

		Reflect.defineMetadata(
			"design:argtypes",
			[
				...(Reflect.getMetadata("design:argtypes", target, propertyKey) || []),
				{
					in: "body" as const,
					schema,
					required: !nullable,
					index: parameterIndex,
					contentType,
					name: typeClass.name,
				} satisfies RequestBody,
			],
			target,
			propertyKey,
		);
	};
};
