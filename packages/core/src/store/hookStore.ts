import { type Dictionary, format } from "@vermi/utils";
import type { EventObject } from "../services";
import { createStore } from "../utils";

export const HookMetadataKey: unique symbol = Symbol("Hook");

export type HandlerMetadata = EventObject<
	Dictionary<any>,
	`${any}`,
	Dictionary<any>
>;

export type HookStoreAPI = {
	addHandler(
		event: string,
		value: EventObject<Dictionary<any>, `${any}`, Dictionary<any>>,
	): void;
	updateScope(prefix: { [key: string]: string }):
		| Map<string, HandlerMetadata[]>
		| undefined;
};

export const hookStore = createStore<
	Map<string, HandlerMetadata[]>,
	HookStoreAPI
>(
	HookMetadataKey,
	(target, get, set) => ({
		addHandler: (event, value: HandlerMetadata) => {
			const store = get() || new Map<string, HandlerMetadata[]>();
			const handlers = store.get(event) || [];

			handlers.push({
				target: value.target || target,
				handler: value.handler,
				scope: value.scope,
			});

			store.set(event, handlers);

			set(store);
		},
		updateScope: (prefix) => {
			const current = get();
			if (!current) return;
			const updated = new Map<string, HandlerMetadata[]>();
			for (const [key, handlers] of current) {
				const newHandler = handlers.map((handler) => {
					if (!handler.scope) {
						return handler;
					}
					return {
						...handler,
						scope: format(handler.scope, prefix)
							.replace(/\/$/g, "")
							.replace(/\/{2,}/g, "/"),
					};
				});
				updated.set(key, newHandler);
			}
			set(updated);
			return updated;
		},
	}),
	() => new Map(),
);
