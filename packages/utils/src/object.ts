import { deepmerge } from "deepmerge-ts";
import type {
	AnyClass,
	Dictionary,
	Path,
	PathValue,
	Primitive,
} from "./internal/object";
import { isUndefined } from "./nullish";

export const isObject = (value: unknown): value is object => {
	return Object(value) !== value;
};

export const isPlainObject = (value: unknown): value is object => {
	if (!isObject(value)) {
		return false;
	}

	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};

export const isClass = <T = any>(value: any): value is AnyClass<T> => {
	return typeof value === "function" && /^\s*class\s+/.test(value.toString());
};

export const isInstance = <T extends abstract new (...args: any) => any>(
	value: any,
): value is InstanceType<T> => {
	return (
		typeof value === "object" && !isPlainObject(value) && !isClass<T>(value)
	);
};

export const isPrimitive = (value: any): value is Primitive => {
	return (
		value === null || (typeof value !== "function" && typeof value !== "object")
	);
};

export const deepEqual = <T>(a: T, b: T): boolean => {
	if (a === b) {
		return true;
	}

	if (a instanceof Object && b instanceof Object) {
		const keysA = Object.keys(a) as (keyof T)[];
		const keysB = Object.keys(b) as (keyof T)[];

		if (keysA.length !== keysB.length) {
			return false;
		}

		for (const key of keysA) {
			if (!deepEqual(a[key], b[key])) {
				return false;
			}
		}

		return true;
	}

	// a, b are arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}

		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) {
				return false;
			}
		}

		return true;
	}

	return false;
};

export const deepMerge = deepmerge;

export const hasOwn = <T extends object>(obj: T, key: string) => {
	return obj && Object.prototype.hasOwnProperty.call(obj, key);
};

export const clone = <T extends object>(obj: T, newPropertyValues: any): T => {
	const clone = new (obj.constructor as { new (): T })();

	const nestedClones = Object.getOwnPropertyNames(clone).reduce(
		(partial, propertyName) => {
			const property = Object.getOwnPropertyDescriptor(clone, propertyName);
			const isNotProvided = isUndefined(
				Object.getOwnPropertyDescriptor(newPropertyValues, propertyName),
			);

			if (isNotProvided) {
				partial[propertyName as keyof T] = property?.value;
			}

			return partial;
		},
		{} as Partial<T>,
	);

	return Object.assign(clone, this, nestedClones, newPropertyValues);
};

export const flatten = <T extends Dictionary>(obj: unknown): T => {
	const flattened = {} as T;

	if (!obj || typeof obj !== "object") {
		return flattened;
	}

	const stack: [string, unknown][] = [["", obj]];
	while (stack.length > 0) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const [prefix, value] = stack.pop()!;
		if (value == null) {
			// @ts-ignore
			flattened[prefix] = value;
		} else if (typeof value !== "object") {
			// @ts-ignore
			flattened[prefix] = value;
		} else if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				stack.push([`${prefix}.${i}`, value[i]]);
			}
		} else {
			for (const key in value) {
				// @ts-ignore
				stack.push([`${prefix}.${key}`, value[key]]);
			}
		}
	}

	return flattened;
};

export const toPlainObject = <T extends object>(obj: AnyClass): T => {
	return JSON.parse(JSON.stringify(obj));
};

export function getVal<T extends object, P extends Path<T>>(
	obj: T,
	key: P,
): PathValue<T, P> | undefined;
export function getVal<
	T extends object,
	P extends Path<T>,
	D = PathValue<T, P>,
>(obj: T, key: P, defaultValue: D): PathValue<T, P> | D;
export function getVal<
	T extends object,
	P extends Path<T>,
	D = PathValue<T, P> | undefined,
>(
	obj: T,
	key: P,
	defaultValue?: D | undefined,
): PathValue<T, P> | D | undefined {
	const keys = key.split(".");
	const val = keys.reduce<PathValue<T, P>>(
		(acc, key) => (acc as never)?.[key as keyof object],
		obj as never,
	);
	return val === undefined ? defaultValue : val;
}

export const setVal = <
	T extends object,
	P extends Path<T>,
	V extends PathValue<T, P>,
>(
	obj: T,
	key: P,
	value: V,
): T => {
	const keys = key.split(".");
	const lastKey = keys.pop() as string;
	const target = keys.reduce<object>(
		(acc, key) => (acc as never)?.[key as keyof object],
		obj as never,
	);
	target[lastKey as keyof object] = value;
	return obj;
};

export * from "./internal/object";
