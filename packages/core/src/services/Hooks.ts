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
		Array<EventHandler<EventType, EnumValues<EventType>, EventMap>>
	>();

	register<Event extends EnumValues<EventType>>(
		event: Event,
		callback: EventHandler<EventType, Event, EventMap>,
	) {
		let handlers = this.#hooks.get(event);
		if (handlers) {
			handlers.push(callback);
		} else {
			handlers = [callback];
		}
		this.#hooks.set(event, handlers);
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
