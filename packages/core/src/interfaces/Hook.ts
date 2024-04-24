import type { EnumValues } from "./Event";

export interface HookMetadata<EventType extends { [key: string]: string }> {
	method: string;
	event: EnumValues<EventType>;
}
