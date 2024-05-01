import { deepMerge } from "@yab/utils";
import { RouterEvent } from "../event";
import {
	getMiddlewareMetadata,
	setMiddlewareMetadata,
} from "../utils/middlewareMetadata";

export const AfterRoute = (order?: number): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getMiddlewareMetadata(target.constructor);

		const merged = deepMerge(existing, {
			target: target.constructor,
			handler: {
				[propertyKey.toString()]: {
					order,
					event: RouterEvent.AfterRoute,
				},
			},
		});
		setMiddlewareMetadata(target.constructor, merged);
	};
};
