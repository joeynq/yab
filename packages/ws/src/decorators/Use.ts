import { dependentStore, hookStore, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { wsHandlerStore } from "../stores";

export const Use = <Middleware extends Class<any>>(
	middleware: Middleware,
): MethodDecorator => {
	return useDecorators(
		(target: any) => {
			dependentStore.apply(target.constructor).addDependents(middleware);
		},
		(target: any, propertyKey: string | symbol) => {
			const middlewareHook = hookStore.apply(middleware).get();

			const eventName = wsHandlerStore
				.apply(target.constructor)
				.findEvent(propertyKey);

			for (const [event, handlers] of middlewareHook.entries()) {
				for (const handler of handlers) {
					hookStore.apply(target.constructor).addHandler(event, {
						...handler,
						scope: `${eventName}:{topic}`,
					});
				}
			}
		},
	);
};
