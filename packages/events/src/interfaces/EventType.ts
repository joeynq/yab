import type { Dictionary, EnumValues } from "@vermi/utils";

export interface EventType<
	Payload,
	EventType extends { [key: string]: string } = Dictionary<string>,
	Event extends EnumValues<EventType> = EnumValues<EventType>,
> {
	payload: Payload;
	id: string;
	timestamp: number;
	type: Event;
}
