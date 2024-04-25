import type { EnumValues, EventPayload } from "../interfaces";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, unknown[]>,
> = (...args: EventPayload<EventType, Event, EventMap>) => void | Promise<void>;

export class Hooks<
	EventType extends { [key: string]: string },
	EventMap extends Record<EnumValues<EventType>, unknown[]>,
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
		...args: EventPayload<EventType, Event, EventMap>
	) {
		const hooks = this.#hooks.get(event);
		if (hooks) {
			// run all hooks in sequence order and get the result
			for (const hook of hooks) {
				await hook(...args);
			}
		}
	}
}
