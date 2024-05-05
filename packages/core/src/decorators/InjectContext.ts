import { type RequestContext, getContextRef } from "../services";

export const InjectContext = <T>(
	prop?: keyof RequestContext | string | symbol,
): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		Object.defineProperty(target, key, {
			get() {
				return prop
					? getContextRef().get<T>(prop.toString())
					: getContextRef().get();
			},
		});
	};
};
