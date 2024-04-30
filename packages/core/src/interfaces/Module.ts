import { type AnyFunction, type Dictionary, uuid } from "@yab/utils";
import type { TLSOptions } from "bun";

export interface ModuleConstructor<Config extends Dictionary = Dictionary> {
	new (...args: any[]): Module<Config>;
}

export abstract class Module<Config extends Dictionary = Dictionary> {
	abstract config: Config;
	id = uuid();
}

export interface ModuleConfig<Config extends Dictionary = Dictionary> {
	name: string;
	id: string;
	config?: Config;
	hooks?: {
		[key: string]: AnyFunction[];
	};
}

export interface YabOptions {
	port?: string | number;
	hostname?: string;
	modules: ModuleConfig[];
	logLevel?: string;
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
}
