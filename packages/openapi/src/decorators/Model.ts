import { type ObjectOptions, Type } from "@sinclair/typebox";
import { saveStoreData } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { ModelStoreKey, modelStore, propsStore } from "../stores";

export const SchemaKey = Symbol("Schema");

export const Model = <T>(options?: ObjectOptions) => {
	return (target: Class<T>) => {
		const props = propsStore.apply(target).get();
		const schema = Type.Object(props, {
			...options,
			$id: `#/components/schemas/${target.name}`,
		});

		const store = modelStore.apply(target);
		store.addSchema(schema);

		saveStoreData(ModelStoreKey, store.get());

		Object.defineProperty(target, SchemaKey, {
			value: schema,
		});
		return target;
	};
};
