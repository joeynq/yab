import { LRUCache } from "lru-cache";
import type { CacheAdapter } from "../interfaces";

export class LruAdapter
	implements CacheAdapter<LRUCache.Options<string, any, unknown>>
{
	#cache: LRUCache<string, any>;

	constructor(public options: LRUCache.Options<string, any, unknown>) {
		this.#cache = new LRUCache(options);
	}

	async get(key: string) {
		return this.#cache.get(key);
	}

	async set(key: string, value: any, ttl?: number) {
		this.#cache.set(key, value, {
			ttl,
		});
	}

	async delete(key: string) {
		this.#cache.delete(key);
	}

	async clear() {
		this.#cache.clear();
	}
}
