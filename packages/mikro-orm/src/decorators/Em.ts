import { containerRef } from "@yab/core";
import { getToken } from "../utils/getToken";

export function Em(contextName = "default") {
	return (target: any, propertyKey: string) => {
		Object.defineProperty(target, propertyKey, {
			get() {
				return containerRef().resolveValue(`${getToken(contextName)}.em`);
			},
		});
	};
}
