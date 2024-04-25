import { container } from "../container";
import { YabHook } from "./YabHook";

const OnInitSymbol = Symbol("OnInit");

export const PropInject = (): PropertyDecorator => {
	return (target, key) => {
		const token = Reflect.getMetadata("design:type", target, key);

		// define new property onInit
		Object.defineProperty(target, OnInitSymbol, {
			value() {
				const value = container.resolve(token.name);
				Object.defineProperty(this, key, {
					value,
					writable: false,
				});
			},
			writable: false,
		});

		const descriptor = Object.getOwnPropertyDescriptor(target, OnInitSymbol);
		descriptor && YabHook("init")(target, OnInitSymbol, descriptor);
	};
};
