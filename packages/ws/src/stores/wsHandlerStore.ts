import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const WsHandlerStoreKey = Symbol("WsHandlerStoreKey");

export interface WsHandler {
	eventStore: Class<any>;
	method: string;
	topic: string;
}

type WsHandlerStoreAPI = {
	addHandler(event: string, handler: WsHandler): void;
	updateChannel(event: string, topic: string): void;
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
				current.set(event, handler);
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
	}),
	() => new Map(),
);
