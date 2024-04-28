import { useContainerRef } from "@yab/core";
import { getToken } from "../utils/getToken";

export function Em(contextName = "default") {
	return (target: any, propertyKey: string) => {
		const orm = useContainerRef().resolve(getToken(contextName));

		Object.defineProperty(target, propertyKey, {
			get() {
				return orm.em.fork();
			},
		});
	};
}
