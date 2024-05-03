import { type AnyFunction, type Dictionary, uuid } from "@yab/utils";
import type { TLSOptions } from "bun";

export abstract class Module<Config extends Dictionary = Dictionary> {
	abstract config: Config;
	id = uuid();
}

export interface ModuleConfig<Config extends Dictionary = Dictionary> {
	moduleInstance: Module<Config>;
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
