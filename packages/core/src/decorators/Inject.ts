import type { AnyClass, Dictionary } from "@yab/utils";
import { YabEvents } from "../events";
import type { RequestContext } from "../interfaces";
import { getTokenName } from "../utils";
import { Hook } from "./Hook";

export const AutoHookEvent = Symbol("AutoHookEvent");

type AutoHookStore = Dictionary<string>;

export const AutoHook = (event: string = YabEvents.OnInit) => {
	return <T extends { new (...args: any[]): any }>(target: T) => {
		const funcName = `__${event}__`;

		const hookStores: AutoHookStore = Reflect.getMetadata(
			AutoHookEvent,
			target,
		);

		Object.defineProperty(target.prototype, funcName, {
			value: function (context: RequestContext) {
				for (const key in hookStores) {
					const tokenName = hookStores[key];

					Object.defineProperty(this, key, {
						get: () => context.resolve(tokenName),
						configurable: true,
					});
				}
			},
		});

		const descriptor = Object.getOwnPropertyDescriptor(
			target.prototype,
			funcName,
		);

		descriptor && Hook(event, "before")(target.prototype, funcName, descriptor);
	};
};

export const Inject = (
	token: AnyClass | string,
	event?: string,
): PropertyDecorator => {
	return (target, key) => {
		let tokenName: string;

		if (token) {
			tokenName = getTokenName(token);
		} else {
			tokenName = Reflect.getMetadata("design:type", target, key).name;
		}

		const hookStores: AutoHookStore =
			Reflect.getMetadata(AutoHookEvent, target.constructor) || {};

		hookStores[key.toString()] = tokenName;

		Reflect.defineMetadata(AutoHookEvent, hookStores, target.constructor);

		return target;
	};
};
