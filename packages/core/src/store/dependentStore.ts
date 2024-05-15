import type { Class } from "@vermi/utils";
import { createStore } from "../utils";

export const DependentMetadataKey: unique symbol = Symbol("Dependent");

export type DependentStoreAPI = {
	addDependent(name: Class<any>): void;
};

export const dependentStore = createStore<Class<any>[], DependentStoreAPI>(
	DependentMetadataKey,
	(_, get, set) => ({
		addDependent(name: Class<any>) {
			const store = get() || [];
			store.push(name);
			set(store);
		},
	}),
	() => [],
);
