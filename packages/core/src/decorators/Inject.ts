import type { AnyClass } from "@yab/utils";
import type { InitContext } from "../events";
import { getTokenName } from "../utils";
import { YabHook } from "./YabHook";

const OnInitSymbol = Symbol("__OnInit__");

export const Inject = (
	token?: AnyClass | symbol | string,
): PropertyDecorator => {
	return (target, key) => {
		let tokenName: string;

		if (token) {
			tokenName = getTokenName(token);
		} else {
			tokenName = Reflect.getMetadata("design:type", target, key).name;
		}

		const funcName = `${OnInitSymbol.description}:${tokenName}`;

		Object.defineProperty(target, funcName, {
			value: function ({ container }: InitContext) {
				Object.defineProperty(this, key, {
					get: () => {
						const result = container.resolveValue(tokenName);
						return result;
					},
				});
			},
			writable: true,
		});

		const descriptor = Object.getOwnPropertyDescriptor(target, funcName);

		descriptor && YabHook("app:init")(target, funcName, descriptor);
	};
};
