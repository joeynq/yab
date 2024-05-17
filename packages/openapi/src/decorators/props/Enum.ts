import { type SchemaOptions, type TEnumKey, Type } from "@sinclair/typebox";
import { getEnumValues } from "@vermi/router";
import { propsStore } from "../../stores";

export function NumberEnum<T extends Record<TEnumKey, number>>(
	item: T,
	options?: SchemaOptions & { nullable?: boolean },
) {
	return (target: any, propertyKey: string) => {
		let schema = getEnumValues("number", item, options);

		if (options?.nullable) {
			schema = Type.Optional(schema);
		}

		propsStore.apply(target.constructor).addProperty(propertyKey, schema);
	};
}

export function StringEnum<T extends Record<TEnumKey, string>>(
	item: T,
	options?: SchemaOptions & { nullable?: boolean },
) {
	return (target: any, propertyKey: string) => {
		let schema = getEnumValues("string", item, options);

		if (options?.nullable) {
			schema = Type.Optional(schema);
		}

		propsStore.apply(target.constructor).addProperty(propertyKey, schema);
	};
}
