import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const EventStoreKey = Symbol("EventStoreKey");

export interface Event {
	className: string;
	event: string;
	propertyKey: string | symbol;
	handlerId: string;
}

export interface EventArg {
	parameterIndex: number;
	schema: TSchema;
	handlerId: string;
	required?: boolean;
	pipes?: Class<any>[];
}

export interface EventStore {
	events: Map<string, Event>;
	args: EventArg[];
}

export type EventStoreAPI = {
	addEvent(event: string, propertyKey: string | symbol): void;
	addArg(
		propertyKey: string | symbol,
		parameterIndex: number,
		schema: TSchema,
		options?: { required?: boolean; pipes?: Array<Class<any>> },
	): void;
};

export const eventStore = createStore<EventStore, EventStoreAPI>(
	EventStoreKey,
	(target, get, set) => ({
		addEvent(event, propertyKey) {
			const current = get();

			const events = new Map(current.events);

			events.set(event, {
				className: target.name,
				event,
				propertyKey,
				handlerId: `${target.name}.${String(propertyKey)}`,
			});
			set({ ...current, events });
		},
		addArg(propertyKey, parameterIndex, schema, options) {
			const current = get();

			const args = current.args.slice();
			args.push({
				parameterIndex,
				schema,
				handlerId: `${target.name}.${String(propertyKey)}`,
				...options,
			});

			set({ ...current, args });
		},
	}),
	() => ({
		events: new Map(),
		args: [],
	}),
);
