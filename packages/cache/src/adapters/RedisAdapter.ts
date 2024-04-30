import { Injectable } from "@yab/core";
import { Redis, type RedisOptions } from "ioredis";
import type { CacheAdapter } from "../interfaces";

@Injectable()
export class RedisAdapter implements CacheAdapter {
	#client: Redis;
	constructor(options: RedisOptions) {
		this.#client = new Redis(options);
	}

	async get(key: string) {
		const value = await this.#client.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttl?: number) {
		if (ttl) {
			await this.#client.set(key, JSON.stringify(value), "EX", ttl);
		}
		await this.#client.set(key, JSON.stringify(value));
	}

	async delete(key: string) {
		await this.#client.del(key);
	}

	async clear() {
		await this.#client.flushall();
	}
}
