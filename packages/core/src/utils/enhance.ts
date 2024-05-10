import { isClass } from "@yab/utils";
import { type AwilixContainer, asClass, asFunction, asValue } from "awilix";
import { getTokenName } from ".";
import {
	type EnhancedContainer,
	type ExposedContext,
	InjectionScope,
	type InjectionToken,
} from "../interfaces";

export { asClass, asFunction, asValue };

export const enhance = <T extends object>(container: AwilixContainer<T>) => {
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

	Object.defineProperty(container, "registerValue", {
		value: function <T>(
			token: InjectionToken<T>,
			value: T,
			scope = InjectionScope.Singleton,
		) {
			const tokenName = getTokenName(token);

			(this as AwilixContainer).register({
				[tokenName]: isClass(value)
					? asClass(value, { lifetime: scope })
					: asValue(value),
			});
		},
	});

	Object.defineProperty(container, "isRegistered", {
		value: function <T>(token: InjectionToken<T>) {
			const tokenName = getTokenName(token);
			return (this as AwilixContainer).hasRegistration(tokenName);
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
