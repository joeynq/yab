import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const WsHandlerStoreKey = Symbol("WsHandlerStoreKey");

export interface WsHandler {
	eventStore: Class<any>;
	method: string;
	topic: string;
	schema?: TSchema;
	handlerId: string;
}

type WsHandlerStoreAPI = {
	addHandler(event: string, handler: Omit<WsHandler, "handlerId">): void;
	updateChannel(event: string, topic: string): void;
	findEvent(prop: string | symbol): string | undefined;
};

export const wsHandlerStore = createStore<
	Map<string, WsHandler>,
	WsHandlerStoreAPI
>(
	WsHandlerStoreKey,
	(_, get, set) => ({
		addHandler(event: string, handler) {
			const current = get() || new Map<string, WsHandler>();
			if (!current.has(event)) {
				current.set(event, {
					...handler,
					handlerId: `${handler.eventStore.name}.${handler.method}`,
				});
				set(current);
			}
		},
		updateChannel(event: string, topic: string) {
			const current = get() || new Map<string, WsHandler>();
			const handler = current.get(event);
			if (handler) {
				handler.topic = topic;
				current.set(event, handler);
				set(current);
			}
		},
		findEvent(prop: string | symbol) {
			const current = get();
			if (!current) return;

			for (const [event, handler] of current) {
				if (handler.method === prop) {
					return event;
				}
			}
		},
	}),
	() => new Map(),
);
