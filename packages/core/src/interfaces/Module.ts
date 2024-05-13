import type { Class, Dictionary } from "@vermi/utils";
import type { TLSOptions } from "bun";
import type { LogOptions } from "./LoggerAdapter";

export interface ModuleConfig<Config> {
	module: Class<any>;
	config: Config;
}

export interface AppOptions {
	port?: string | number;
	hostname?: string;
	modules: Map<string, ModuleConfig<any>>;
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
	log?: LogOptions<never>;
}

export interface UseModule<M extends Class<any>, Config> {
	module: M;
	args: Config;
}
