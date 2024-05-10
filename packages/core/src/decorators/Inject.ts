import type { AnyClass } from "@vermi/utils";
import { getTokenName } from "../utils";
import { AutoHookEvent, type AutoHookStore } from "./AutoHook";

export const Inject = (token: AnyClass | string): PropertyDecorator => {
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
