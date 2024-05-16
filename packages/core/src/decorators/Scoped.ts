import type { InjectionToken, RequestContext } from "../interfaces";
import { injectStore } from "../store";

const injectionMethodName = Symbol("__injecting__");

export const Scoped = <T>(token?: InjectionToken<T>) => {
	return (target: any, propertyKey: string | symbol) => {
		const methodName = `${injectionMethodName.toString()}${propertyKey.toString()}`;
		Object.defineProperty(target, methodName, {
			value: function injectValue(context: RequestContext) {
				Object.defineProperty(target, propertyKey, {
					get: () => context.resolve(token || propertyKey.toString()),
					configurable: true,
				});
			},
			enumerable: false,
		});

		injectStore.apply(target.constructor).addEventHandler(methodName);
	};
};
