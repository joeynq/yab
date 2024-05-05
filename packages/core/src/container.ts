import { isClass } from "@yab/utils";
import {
	type AwilixContainer,
	InjectionMode,
	asClass,
	asFunction,
	asValue,
	createContainer,
} from "awilix";
import {
	type EnhancedContainer,
	InjectionScope,
	type InjectionToken,
} from "./interfaces";
import { getTokenName } from "./utils";

export { asClass, asValue, asFunction };

const enhance = <T extends object>(container: AwilixContainer<T>) => {
	Object.defineProperty(container, "resolveValue", {
		value: function <T>(token: InjectionToken<T>) {
			const tokenName = getTokenName(token);
			return this.resolve(tokenName);
		},
	});

	Object.defineProperty(container, "registerValue", {
		value: function <T>(
			token: InjectionToken<T>,
			value: T,
			scope = InjectionScope.Singleton,
		) {
			const tokenName = getTokenName(token);

			this.register({
				[tokenName]: isClass(value)
					? asClass(value, { lifetime: scope })
					: asValue(value),
			});
		},
	});

	return container as EnhancedContainer<T>;
};

const container = enhance(
	createContainer({
		injectionMode: InjectionMode.CLASSIC,
		strict: true,
	}),
);

export const containerRef = () => container;

export const scopedContainer = <T extends object>(
	container: EnhancedContainer<T>,
) => enhance(container.createScope());

export const resolveValue = container.resolveValue.bind(container);

export const registerValue = container.registerValue.bind(container);
