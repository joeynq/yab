import type { AnyClass } from "@yab/utils";
import type { InitContext } from "../events";
import { getTokenName } from "../utils";
import { YabHook } from "./YabHook";

const OnInitSymbol = Symbol("OnInit");

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

		// define new property onInit
		Object.defineProperty(target, OnInitSymbol, {
			value({ container }: InitContext) {
				const value = container.resolve(tokenName);
				Object.defineProperty(this, key, {
					value,
					writable: false,
				});
			},
			writable: false,
		});

		const descriptor = Object.getOwnPropertyDescriptor(target, OnInitSymbol);
		descriptor && YabHook("app:init")(target, OnInitSymbol, descriptor);
	};
};
