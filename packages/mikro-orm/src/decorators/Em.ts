import { containerRef } from "@vermi/core";
import { getToken } from "../utils";

export function Em(contextName = "default") {
	return (target: any, propertyKey: string) => {
		Object.defineProperty(target, propertyKey, {
			get() {
				return containerRef().resolveValue(`${getToken(contextName)}.em`);
			},
		});
	};
}
