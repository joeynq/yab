import type { Context } from "../interfaces";
import { getContextRef } from "../services";

export const InjectContext = (prop?: keyof Context): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		Object.defineProperty(target, key, {
			get() {
				return getContextRef().get(prop);
			},
		});
	};
};
