import { resolveValue } from "@yab/core";
import type { CacheAdapter } from "../interfaces/CacheAdapter";

export interface UseCacheOptions {
	ttl: number;
}

type Func = (...args: any[]) => any;

export function UseCache(options?: UseCacheOptions): MethodDecorator {
	return (target, key, descriptor) => {
		const originalMethod = descriptor.value as Func;

		// @ts-expect-error
		descriptor.value = async function (...args: any[]) {
			const cacheKey = `${
				target.constructor.name
			}:${key.toString()}:${JSON.stringify(args)}`;
			const cache = resolveValue<CacheAdapter>("cache");
			const cached = await cache.get(cacheKey);

			if (cached) {
				return cached;
			}

			const result = await originalMethod?.apply(this, args);
			cache.set(cacheKey, result, options?.ttl);

			return result;
		};

		return descriptor;
	};
}
