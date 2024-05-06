import {
	type AnyClass,
	type AnyFunction,
	type Dictionary,
	uuid,
} from "@yab/utils";
import type { TLSOptions } from "bun";
import type { LogLevel } from "./LoggerAdapter";

export abstract class YabModule<Config extends Dictionary = Dictionary> {
	abstract config: Config;
	id = uuid();
}

export interface ModuleConfig<Config extends Dictionary = Dictionary> {
	moduleInstance: YabModule<Config>;
	hooks?: {
		[key: string]: AnyFunction[];
	};
}

export interface YabOptions {
	port?: string | number;
	hostname?: string;
	modules: ModuleConfig[];
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
	log?: {
		noColor?: boolean;
		level?: LogLevel;
		stackTrace?: boolean;
	};
}

export interface YabUse<M extends AnyClass<YabModule>> {
	module: M;
	args: ConstructorParameters<M>;
}
