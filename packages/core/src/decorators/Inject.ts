import type { AnyClass } from "@yab/utils";
import { container } from "../container";
import { YabHook } from "./YabHook";

const OnInitSymbol = Symbol("OnInit");

export const Inject = (
	token?: AnyClass | symbol | string,
): PropertyDecorator => {
	return (target, key) => {
		let tokenName: string;

		if (typeof token === "string") {
			tokenName = token;
		} else if (typeof token === "symbol") {
			tokenName = token.toString();
		} else if (token) {
			tokenName = token.name;
		} else {
			tokenName = Reflect.getMetadata("design:type", target, key).name;
		}
		console.log(tokenName);

		// define new property onInit
		Object.defineProperty(target, OnInitSymbol, {
			value() {
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
