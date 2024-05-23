import type { Class } from "@vermi/utils";
import {
	type AwilixContainer,
	type BuildResolver,
	asClass,
	asFunction,
	asValue,
} from "awilix";
import { getTokenName } from ".";
import {
	type EnhancedContainer,
	type ExposedContext,
	type InjectionToken,
	type _AppContext,
} from "../interfaces";
import { dependentStore, hookStore } from "../store";

export { asClass, asFunction, asValue };

export const enhance = <T extends object>(container: AwilixContainer<T>) => {
	Object.defineProperty(container, "registerServices", {
		value: function <T>(...serviceClasses: Class<T>[]): Record<string, T> {
			const self = this as EnhancedContainer<_AppContext>;

			const services: Record<string, T> = {};
			const registering: Record<string, BuildResolver<any>> = {};

			for (const serviceClass of serviceClasses) {
				const resolver = asClass(serviceClass);

				registering[serviceClass.name] = resolver;
				const instance = self.build(resolver);
				services[serviceClass.name] = instance;

				const serviceHooks = hookStore.apply(serviceClass).get();
				for (const [event, handlers] of serviceHooks.entries()) {
					for (const { target, handler, scope } of handlers) {
						self.cradle.hooks.register(event as any, {
							target: target?.name === serviceClass.name ? undefined : target,
							handler: handler.bind(instance),
							scope,
						});
					}
				}
			}

			self.register(registering);

			const dependents = dependentStore.combineStore(...serviceClasses);
			if (dependents?.length) {
				self.registerServices(...dependents);
			}

			return services;
		},
	});

	Object.defineProperty(container, "resolveValue", {
		value: function <T>(token: InjectionToken<T>) {
			const tokenName = getTokenName(token);

			const self = this as AwilixContainer;

			if (!self.hasRegistration(tokenName)) {
				return undefined;
			}

			return self.resolve(tokenName);
		},
	});

	Object.defineProperty(container, "expose", {
		value: function (): ExposedContext<T> {
			return {
				get store() {
					return container.cradle;
				},
				resolve: (this as EnhancedContainer<T>).resolveValue.bind(this),
				register: (this as AwilixContainer<T>).register.bind(this),
				build: (this as AwilixContainer<T>).build.bind(this),
				registerServices: (this as EnhancedContainer<T>).registerServices.bind(
					this,
				),
			};
		},
	});

	Object.defineProperty(container, "createEnhancedScope", {
		value: function () {
			return enhance((this as AwilixContainer<T>).createScope());
		},
	});

	return container as EnhancedContainer<T>;
};
