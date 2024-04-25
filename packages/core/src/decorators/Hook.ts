import type { EnumValues } from "../interfaces/Event";
import { HookMetadataKey } from "../symbols/metadata";

export function Hook<EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
): MethodDecorator {
	return (target, key) => {
		const existingHooks = Reflect.getMetadata(HookMetadataKey, target) as
			| Record<string, (string | symbol)[]>
			| undefined;

		if (existingHooks) {
			existingHooks[event] = existingHooks[event] ?? [];
			existingHooks[event].push(key);
		} else {
			Reflect.defineMetadata(
				HookMetadataKey,
				{
					[event]: [key],
				},
				target,
			);
		}
	};
}
