import {
	type AwilixContainer,
	InjectionMode,
	asValue,
	createContainer,
} from "awilix";
import type { ModuleConstructor } from "./interfaces";
import type { EnhancedContainer, InjectionToken } from "./interfaces/Container";

const enhance = (container: AwilixContainer) => {
	Object.defineProperty(container, "registerModule", {
		value: function <M extends ModuleConstructor>(
			module: M,
			...args: ConstructorParameters<M>
		) {
			const instance = new module(...args);
			this.register({
				[`${module.name}.${instance.id}`]: asValue(instance),
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

export const container = enhance(
	createContainer({
		injectionMode: InjectionMode.CLASSIC,
		strict: true,
	}),
);
