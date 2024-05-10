import { deepMerge } from "@yab/utils";
import type { HttpMethod } from "../enums";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Action = (method: HttpMethod, path: string): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getControllerMetadata(target.constructor);
		const merged = deepMerge(existing, {
			routes: {
				[propertyKey.toString()]: {
					method,
					path,
				},
			},
		});
		setControllerMetadata(target.constructor, merged);
	};
};
