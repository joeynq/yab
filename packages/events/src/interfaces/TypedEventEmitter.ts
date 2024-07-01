import type { EventPayload } from "@vermi/core";
import type {
	Dictionary,
	EnumValues,
	MaybePromise,
	MaybePromiseFunction,
} from "@vermi/utils";

export type EventHandler<
	EventType extends { [key: string]: string } = Dictionary<string>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction> = Record<
		string,
		MaybePromiseFunction
	>,
> = (
	...args: EventPayload<EventType, EnumValues<EventType>, EventMap>
) => MaybePromise<void>;

export interface TypedEventEmitter<
	EventType extends { [key: string]: string } = Dictionary<string>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction> = Record<
		string,
		MaybePromiseFunction
	>,
> {
	on<Event extends EnumValues<EventType>>(
		event: Event,
		handler: EventHandler<EventType, EventMap>,
	): void;

	off<Event extends EnumValues<EventType>>(
		event: Event,
		handler: EventHandler<EventType, EventMap>,
	): void;

	emit<Event extends EnumValues<EventType>>(
		event: Event,
		...args: Parameters<EventHandler<EventType, EventMap>>
	): void;
}
