import { hookStore } from "@vermi/core";
import type { RouterEvent } from "../event";

export const OnRoute = (event: RouterEvent) => {
	return (target: any, propertyKey: string | symbol) => {
		hookStore.apply(target.constructor as any).addHandler(event, {
			target: target.constructor as any,
			handler: target[propertyKey],
		});
	};
};
