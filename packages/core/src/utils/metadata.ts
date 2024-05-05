import {
	type AnyClass,
	type DeepPartial,
	deepMerge,
	isClass,
	isInstance,
} from "@yab/utils";

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
	position: "before" | "after" = "after",
): void => {
	const existing = getMetadata<T>(key, target) ?? {};
	setMetadata(
		key,
		position === "after"
			? deepMerge(existing, value)
			: deepMerge(value, existing),
		target,
	);
};

export const getTokenName = (token: string | AnyClass): string => {
	if (isClass(token)) {
		return token.name;
	}
	if (isInstance(token)) {
		return token.constructor.name;
	}
	return token;
};
