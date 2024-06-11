import { ensure, stringify } from "@vermi/utils";
import { Redis, type RedisOptions } from "ioredis";
import type { CacheAdapter } from "../interfaces";

export class RedisAdapter<Data = any>
	implements CacheAdapter<Data, RedisOptions>
{
	#client: Redis;
	constructor(public options: RedisOptions) {
		this.#client = new Redis(options);
	}

	async get(key: string) {
		const value = await this.#client.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttl?: number) {
		const val = value ? stringify(value) : undefined;
		ensure(val, new Error("Value must be defined"));

		if (ttl) {
			await this.#client.set(key, val, "EX", ttl);
		}
		await this.#client.set(key, val);
	}

	async delete(key: string) {
		await this.#client.del(key);
	}

	async clear() {
		await this.#client.flushall();
	}
}
