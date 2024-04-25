import { type DeepPartial, deepMerge } from "@yab/utils";

export const getMetadata = <T = any>(
	key: string | symbol,
	target: any,
): T | undefined => {
	return Reflect.getMetadata(key, target);
};

export const setMetadata = <T = any>(
	key: string | symbol,
	value: T,
	target: any,
): void => {
	Reflect.defineMetadata(key, value, target);
};

export const mergeMetadata = <T extends object = object>(
	key: string | symbol,
	value: DeepPartial<T>,
	target: any,
): void => {
	const existing = getMetadata<T>(key, target) ?? {};
	setMetadata(key, deepMerge(existing, value), target);
};
