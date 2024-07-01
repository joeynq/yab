import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { EventType } from "../interfaces";

export const EventStoreKey = Symbol("EventStoreKey");

export type EventFilter = <Payload>(event: EventType<Payload>) => boolean;

export interface HandlerMetadata {
	filter: EventFilter;
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
	className: string;
	pattern: string | RegExp;
	events: HandlerMetadata[];
	args: EventArg[];
}

export type EventStoreAPI = {
	addHandler(filter: EventFilter | string, propertyKey: string | symbol): void;
	addArg(
		propertyKey: string | symbol,
		parameterIndex: number,
		schema: TSchema,
		options?: { required?: boolean; pipes?: Array<Class<any>> },
	): void;
	setPattern(pattern: string | RegExp): void;
};

export const eventStore = createStore<EventStore, EventStoreAPI>(
	EventStoreKey,
	(target, get, set) => ({
		setPattern(pattern: string | RegExp) {
			const current = get();
			set({ ...current, pattern, className: target.name });
		},
		addHandler(filter: EventFilter | string, propertyKey) {
			const current = get();

			const existing = current.events.find(
				(event) => event.propertyKey === propertyKey,
			);
			if (existing) {
				return;
			}

			const eventFilter =
				typeof filter === "string"
					? (event: any) => event.type === filter
					: filter;

			current.events.push({
				filter: eventFilter,
				propertyKey,
				handlerId: `${target.name}.${String(propertyKey)}`,
			});

			set(current);
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
		className: "",
		pattern: "",
		events: [],
		args: [],
	}),
);
