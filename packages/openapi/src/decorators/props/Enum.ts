import {
	type SchemaOptions,
	type TEnumKey,
	type TEnumValue,
	Type,
} from "@sinclair/typebox";
import { propsStore } from "../../stores";

export function Enum<V extends TEnumValue, T extends Record<TEnumKey, V>>(
	item: T,
	options?: SchemaOptions & { nullable?: boolean },
) {
	return (target: any, propertyKey: string) => {
		let schema = Type.Enum(item, options);

		if (options?.nullable) {
			schema = Type.Optional(schema);
		}

		propsStore.apply(target.constructor).addProperty(propertyKey, schema);
	};
}
