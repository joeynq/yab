import { Database, type Statement } from "bun:sqlite";
import { stringify } from "@vermi/utils";
import type { CacheAdapter } from "../interfaces";

type CacheRow = {
	key: string;
	value: string;
	ttl: number;
};

type PreparedStatements = {
	get: Statement<CacheRow, [string]>;
	set: Statement<CacheRow, [string, string, number | null]>;
	delete: Statement<null, [string]>;
	clear: Statement<null, []>;
};

export class SqliteAdapter implements CacheAdapter {
	#db: Database;

	#table = "cache";

	#prepared!: PreparedStatements;

	constructor(file = ":memory:") {
		this.#db = new Database(file);
		this.#createTable();
		this.#prepareStatements();
	}

	#createTable() {
		this.#db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.#table} (
        key TEXT PRIMARY KEY,
        value TEXT,
        ttl INTEGER
      );
    `);
	}

	#prepareStatements() {
		this.#prepared = {
			get: this.#db.prepare(
				`SELECT value FROM ${this.#table} WHERE key = ? AND (ttl IS NULL OR ttl > strftime('%s', 'now'))`,
			),
			set: this.#db.prepare(`
        INSERT INTO ${this.#table} (key, value, ttl) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, ttl = EXCLUDED.ttl`),
			delete: this.#db.prepare(`DELETE FROM ${this.#table} WHERE key = ?`),
			clear: this.#db.prepare(`DROP TABLE ${this.#table}`),
		};
	}

	async get(key: string) {
		const row = this.#prepared.get.get(key);
		return row ? JSON.parse(row.value) : null;
	}

	async set(key: string, value: any, ttl?: number) {
		this.#prepared.set.run(
			key,
			stringify(value) || "",
			ttl ? Date.now() + ttl : null,
		);
	}

	async delete(key: string) {
		this.#prepared.delete.run(key);
	}

	async clear() {
		this.#prepared.clear.run();
		this.#createTable();
	}
}
