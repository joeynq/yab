import type { Hooks } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { getMiddlewareMetadata } from "./middlewareMetadata";

export const registerMiddlewares = (
	hooks: Hooks<any, any>,
	middlewares: AnyClass<any>[],
) => {
	for (const middleware of middlewares) {
		const middlewareData = getMiddlewareMetadata(middleware);
		const instance = new middleware();
		for (const [key, value] of Object.entries(middlewareData.handler)) {
			hooks.register(value.event, instance[key].bind(instance));
		}
	}
};
