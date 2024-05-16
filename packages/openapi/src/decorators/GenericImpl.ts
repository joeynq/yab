import { type ObjectOptions, Type } from "@sinclair/typebox";
import { saveStoreData } from "@vermi/core";
import { type Class, pascalCase } from "@vermi/utils";
import { ModelStoreKey, modelStore, propsStore } from "../stores";
import type { GenericBuilder } from "../utils";
import { SchemaKey } from "./Model";

export const GenericImpl = <T>(
	generic: Class<any>,
	options?: ObjectOptions,
	name?: string,
) => {
	const genericBuilder = Reflect.getMetadata(
		"generic:builder",
		generic,
	) as GenericBuilder;
	return (target: Class<T>) => {
		const props = propsStore.apply(target).get();

		const T = Type.Object(props, {
			...options,
			$id: `#/components/schemas/${pascalCase(name || target.name)}`,
		});

		const schema = genericBuilder(T, pascalCase(name || target.name));

		const store = modelStore.apply(target);
		store.addSchema(schema);

		saveStoreData(ModelStoreKey, store.get());

		Object.defineProperty(target, SchemaKey, {
			value: schema,
		});
		return target;
	};
};
