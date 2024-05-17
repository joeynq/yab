import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const EventHandlerKey = Symbol("EventHandlerKey");

type EventHandler = {
	class: Class<any>;
	eventKey: string;
	methodName: string;
};

type HandlerStoreAPI = {
	addHandler(handler: EventHandler): void;
};

export const handlerStore = createStore<EventHandler[], HandlerStoreAPI>(
	EventHandlerKey,
	(_, get, set) => ({
		addHandler(handler) {
			const current = get() || [];
			set([...current, handler]);
		},
	}),
	() => [],
);
