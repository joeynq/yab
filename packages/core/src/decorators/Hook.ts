import type { EnumValues } from "@yab/utils";
import { HookMetadataKey } from "../symbols";
import { mergeMetadata } from "../utils";

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
	position: "before" | "after" = "after",
): MethodDecorator {
	return (target, key) => {
		// mergeMetadata(HookMetadataKey, { [event]: [key] }, target, position);

		mergeMetadata(
			HookMetadataKey,
			{
				[event]: [
					{
						target: undefined,
						method: key,
						scoped: undefined,
					},
				],
			},
			target,
			position,
		);
	};
}
