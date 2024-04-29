import { type AnyFunction, type Dictionary, uuid } from "@yab/utils";
import type { Serve } from "bun";

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

interface YabInternalOptions {
	modules: ModuleConfig[];
	logLevel?: string;
}

export type YabOptions = YabInternalOptions & Omit<Serve, "fetch">;
