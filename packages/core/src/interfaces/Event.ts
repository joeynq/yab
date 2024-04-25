import type { EnumValues } from "@yab/utils";

export type EventParameterMap<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
> = Record<Event, unknown[]>;

export type EventPayload<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, unknown[]>,
> = EventMap[Event];
