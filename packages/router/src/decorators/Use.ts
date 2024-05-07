import { type AnyClass, deepMerge } from "@yab/utils";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Use = <Middleware extends AnyClass>(
	middleware: Middleware,
): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		const existing = getControllerMetadata(target.constructor);

		if (!existing.routes[String(propertyKey)]) {
			throw new Error("Path not found!");
		}

		const merged = deepMerge(existing, {
			routes: {
				[propertyKey.toString()]: {
					middlewares: [middleware],
				},
			},
		});

		setControllerMetadata(target.constructor, merged);
	};
};
