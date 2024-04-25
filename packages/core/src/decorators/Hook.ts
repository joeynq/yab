import type { EnumValues } from "@yab/utils";
import { HookMetadataKey } from "../symbols";
import { mergeMetadata } from "../utils";

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
): MethodDecorator {
	return (target, key) => {
		mergeMetadata(HookMetadataKey, { [event]: [key] }, target);
	};
}
