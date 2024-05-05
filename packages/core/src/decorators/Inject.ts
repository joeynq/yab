import type { AnyClass } from "@yab/utils";
import type { RequestContext } from "../services";
import { getTokenName } from "../utils";
import { YabHook } from "./YabHook";

const OnInitSymbol = Symbol("__OnInit__");

export const Inject = (token?: AnyClass | string): PropertyDecorator => {
	return (target, key) => {
		let tokenName: string;

		if (token) {
			tokenName = getTokenName(token);
		} else {
			tokenName = Reflect.getMetadata("design:type", target, key).name;
		}

		const funcName = `${OnInitSymbol.description}:${String(tokenName)}`;

		Object.defineProperty(target, funcName, {
			value: function (container: RequestContext) {
				Object.defineProperty(this, key, {
					get: () => container.resolve(tokenName),
					configurable: true,
				});
			},
			writable: true,
			configurable: true,
		});

		const descriptor = Object.getOwnPropertyDescriptor(target, funcName);

		descriptor && YabHook("app:init", "before")(target, funcName, descriptor);
		return target;
	};
};
