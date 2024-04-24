import type { EnumValues } from "../interfaces/Event";
import { HookMetadataKey } from "../symbols/metadata";

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
): MethodDecorator {
	return (target, key) => {
		Reflect.defineMetadata(
			HookMetadataKey,
			{
				event,
				method: key,
			},
			target,
		);
	};
}
