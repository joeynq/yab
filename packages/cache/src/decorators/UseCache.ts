import { containerRef } from "@vermi/core";
import { stringify } from "@vermi/utils";
import type { CacheAdapter } from "../interfaces";

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
			}:${key.toString()}:${stringify(args)}`;
			const cache = containerRef().resolve<CacheAdapter>("cache");
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
