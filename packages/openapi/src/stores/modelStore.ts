import { type TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";

export const ModelStoreKey = Symbol("ModelStore");

export type ModelStoreAPI = {
	addSchema: (schema: TSchema) => void;
};

export const modelStore = createStore<TSchema[], ModelStoreAPI>(
	ModelStoreKey,
	(_, get, set) => ({
		addSchema: (schema) => {
			const current = get() || [];
			if (current.find((s) => s.$id === schema.$id)) return;
			set([...current, schema]);
		},
	}),
	() => [],
);
