import type { Dictionary } from "@yab/utils";
import { YabEvents } from "../events";
import type { RequestContext } from "../interfaces";
import { Hook } from "./Hook";

export const AutoHookEvent = Symbol("AutoHookEvent");

export type AutoHookStore = Dictionary<string>;

export const AutoHook = (event: string = YabEvents.OnInit) => {
	return <T extends { new (...args: any[]): any }>(target: T) => {
		const funcName = `__${event}__`;

		const hookStores: AutoHookStore = Reflect.getMetadata(
			AutoHookEvent,
			target,
		);

		Object.defineProperty(target.prototype, funcName, {
			value: function loadDependency(context: RequestContext) {
				for (const key in hookStores) {
					const tokenName = hookStores[key];

					Object.defineProperty(this, key, {
						value: context.resolve(tokenName),
						configurable: true,
						enumerable: true,
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