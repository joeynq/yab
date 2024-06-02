import { dependentStore, hookStore, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { routeStore } from "../stores";

export const Use = <Middleware extends Class<any>>(
	middleware: Middleware,
): MethodDecorator => {
	return useDecorators(
		(target: any) => {
			dependentStore.apply(target.constructor).addDependents(middleware);
		},
		(target: any, propertyKey: string | symbol) => {
			const middlewareHook = hookStore.apply(middleware).get();

			const full = routeStore.apply(target.constructor).findPath(propertyKey);

			if (!full) {
				return;
			}

			const store = hookStore.apply(target.constructor);

			for (const [event, handlers] of middlewareHook.entries()) {
				for (const handler of handlers) {
					store.addHandler(event, {
						...handler,
						scope: full.replace(/\/$/g, ""),
					});
				}
			}
		},
	);
};
