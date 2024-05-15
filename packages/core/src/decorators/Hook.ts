import type { EnumValues } from "@vermi/utils";
import { hookStore } from "../store";

export interface HookOptions {
	scoped?: boolean;
}

export const Hook = <EventType extends { [key: string]: string }>(
	event: EnumValues<EventType>,
	options: HookOptions = {},
) => {
	return (target: any, methodName: string | symbol) => {
		hookStore.apply(target.constructor).addHandler(String(event), {
			handler: target[methodName],
			target: target.constructor,
			scope: options.scoped ? String(methodName) : undefined,
		});
	};
};
