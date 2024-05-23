import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const WsHandlerStoreKey = Symbol("WsHandlerStoreKey");

export interface WsHandler {
	eventStore: Class<any>;
	method: string;
	channel: string;
}

type WsHandlerStoreAPI = {
	addHandler(event: string, handler: WsHandler): void;
	updateChannel(event: string, channel: string): void;
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
		updateChannel(event: string, channel: string) {
			const current = get() || new Map<string, WsHandler>();
			const handler = current.get(event);
			if (handler) {
				handler.channel = channel;
				current.set(event, handler);
				set(current);
			}
		},
	}),
	() => new Map(),
);
