import type { EnumValues, EventPayload } from "../interfaces/Event";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, unknown[]>,
> = (...args: EventPayload<EventType, Event, EventMap>) => void;

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
			await Promise.all([...hooks].map((hook) => hook(...args)));
		}
	}
}
