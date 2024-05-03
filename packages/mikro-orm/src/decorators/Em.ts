import type { MikroORM } from "@mikro-orm/core";
import { resolveValue } from "@yab/core";
import { getToken } from "../utils/getToken";

export function Em(contextName = "default") {
	return (target: any, propertyKey: string) => {
		const orm = resolveValue<MikroORM>(getToken(contextName));

		Object.defineProperty(target, propertyKey, {
			get() {
				return orm.em.fork();
			},
		});
	};
}
