import { deepMerge } from "@vermi/utils";
import type { RouterEvent } from "../event";
import { getMiddlewareMetadata, setMiddlewareMetadata } from "../utils";

export const OnRoute = (
	event: RouterEvent,
	order?: number,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getMiddlewareMetadata(target.constructor);

		const merged = deepMerge(existing, {
			target: target.constructor,
			handler: {
				[propertyKey.toString()]: {
					order,
					event,
				},
			},
		});
		setMiddlewareMetadata(target.constructor, merged);
	};
};
