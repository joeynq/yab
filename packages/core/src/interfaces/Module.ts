import type { Serve } from "bun";

export interface ModuleConstructor<Config = unknown> {
	new (...args: any[]): Module<Config>;
}

export interface Module<Config = unknown> {
	config: Config;
}

interface YabInternalOptions {
	modules: Record<string, unknown>;
}

export type YabOptions = YabInternalOptions & Omit<Serve, "fetch">;
