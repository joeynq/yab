import { type Dictionary, type EnumValues, uuid } from "@vermi/utils";
import type { EventType } from "../interfaces";

export class Event<
	Payload,
	EventMap extends { [key: string]: string } = Dictionary<string>,
	Event extends EnumValues<EventMap> = EnumValues<EventMap>,
> implements EventType<Payload, EventMap, Event>
{
	id = uuid();
	timestamp = new Date().getTime();

	constructor(
		public type: Event,
		public payload: Payload,
	) {}
}
