type StringValues<T> = {
	[K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

export type EnumValues<T> = `${StringValues<T>}`;

export type EventParameterMap<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
> = Record<Event, unknown[]>;

export type EventPayload<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, unknown[]>,
> = EventMap[Event];
