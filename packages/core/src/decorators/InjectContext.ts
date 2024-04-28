import { getContextRef } from "../services";

export const InjectContext = (): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		target[key] = getContextRef();
	};
};
