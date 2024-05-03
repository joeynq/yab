import { isClass } from "@yab/utils";
import {
	type AwilixContainer,
	InjectionMode,
	asClass,
	asValue,
	createContainer,
} from "awilix";
import type { EnhancedContainer, InjectionToken } from "./interfaces";
import { getTokenName } from "./utils";

const enhance = (container: AwilixContainer) => {
	Object.defineProperty(container, "resolveValue", {
		value: function <T>(token: InjectionToken<T>) {
			const tokenName = getTokenName(token);
			return this.resolve(tokenName);
		},
	});

	Object.defineProperty(container, "registerValue", {
		value: function <T>(token: InjectionToken<T>, value: T) {
			const tokenName = getTokenName(token);

			this.register({
				[tokenName]: isClass(value) ? asClass(value) : asValue(value),
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

export const resolveValue = container.resolveValue.bind(container);

export const registerValue = container.registerValue.bind(container);
