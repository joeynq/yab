import {
	type AnyClass,
	type AnyFunction,
	type Dictionary,
	uuid,
} from "@vermi/utils";
import type { TLSOptions } from "bun";
import type { LogOptions } from "./LoggerAdapter";

export abstract class VermiModule<Config extends Dictionary = Dictionary> {
	abstract config: Config;
	id = uuid();
}

export interface ModuleConfig<Config extends Dictionary = Dictionary> {
	moduleInstance: VermiModule<Config>;
	hooks?: {
		[key: string]: AnyFunction[];
	};
}

export interface AppOptions {
	port?: string | number;
	hostname?: string;
	modules: ModuleConfig[];
	env?: Dictionary;
	reusePort?: boolean;
	tls?: TLSOptions;
	log?: LogOptions<never>;
}

export interface UseModule<M extends AnyClass<VermiModule>> {
	module: M;
	args: ConstructorParameters<M>;
}
