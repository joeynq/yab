import {
	type AwilixContainer,
	InjectionMode,
	asValue,
	createContainer,
} from "awilix";
import type {
	EnhancedContainer,
	InjectionToken,
	ModuleConstructor,
} from "./interfaces";

const enhance = (container: AwilixContainer) => {
	Object.defineProperty(container, "resolveClass", {
		value: function <T>(token: InjectionToken<T>) {
			const tokenName = typeof token === "string" ? token : token.name;
			return this.resolve(tokenName);
		},
	});

	Object.defineProperty(container, "registerModule", {
		value: function <M extends ModuleConstructor>(
			module: M,
			...args: ConstructorParameters<M>
		) {
			const instance = new module(...args);
			this.register({
				[module.name]: asValue(instance),
			});
			return instance;
		},
	});

	Object.defineProperty(container, "registerValue", {
		value: function <T>(token: InjectionToken<T>, value: T) {
			const tokenName = typeof token === "string" ? token : token.name;
			this.register({
				[tokenName]: asValue(value),
			});
		},
	});

	return container as EnhancedContainer;
};

const container = enhance(
	createContainer({
		injectionMode: InjectionMode.CLASSIC,
		strict: true,
	}),
);

export const useContainerRef = () => container;
