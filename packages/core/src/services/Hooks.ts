import {
	type EnumValues,
	type MaybePromiseFunction,
	isUndefined,
} from "@yab/utils";
import type { EventPayload, EventResult } from "../interfaces";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = (
	...args: EventPayload<EventType, Event, EventMap>
) => EventResult<EventType, Event, EventMap>;

interface InvokeOptions {
	breakOnResult?: boolean;
	breakOnNull?: boolean;
	breakOnError?: boolean;
}

export class Hooks<
	EventType extends { [key: string]: string },
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> {
	#hooks = new Map<
		string,
		Set<EventHandler<EventType, EnumValues<EventType>, EventMap>>
	>();
	register<Event extends EnumValues<EventType>>(
		event: Event,
		callback: EventHandler<EventType, Event, EventMap>,
	) {
		const handlers = this.#hooks.get(event);
		if (handlers) {
			handlers.add(
				callback as EventHandler<EventType, EnumValues<EventType>, EventMap>,
			);
		} else {
			this.#hooks.set(
				event,
				new Set([
					callback as EventHandler<EventType, EnumValues<EventType>, EventMap>,
				]),
			);
		}
	}

	async invoke<Event extends EnumValues<EventType>>(
		event: Event,
		args: EventPayload<EventType, Event, EventMap>,
		{
			breakOnResult = false,
			breakOnNull = false,
			breakOnError = true,
		}: InvokeOptions = {},
	): Promise<EventResult<EventType, Event, EventMap> | undefined> {
		const hooks = this.#hooks.get(event);
		if (hooks) {
			for (const hook of hooks) {
				try {
					const result = await hook(...args);
					if (breakOnNull && result === null) {
						break;
					}
					if (breakOnResult && !isUndefined(result)) {
						return result;
					}
				} catch (error) {
					if (breakOnError) {
						throw error;
					}
				}
			}
		}
	}
}
