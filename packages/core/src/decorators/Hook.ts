import type { EnumValues } from "@yab/utils";
import { HookMetadataKey } from "../symbols";
import { mergeMetadata } from "../utils";

export interface HookOptions {
	position?: "before" | "after";
	scoped?: boolean;
}

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
	options: HookOptions = {},
): MethodDecorator {
	const { position = "after", scoped } = options;
	return (target, key) => {
		mergeMetadata(
			HookMetadataKey,
			{
				[event]: [
					{
						target: scoped ? target.constructor : undefined,
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
