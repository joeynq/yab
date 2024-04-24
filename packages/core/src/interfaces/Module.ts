import type { Serve } from "bun";

export interface ModuleConstructor {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	new (...args: any[]): Module;
}
export interface Module {
	id: string;
}

interface YabInternalOptions {
	modules: [ModuleConstructor, ...unknown[]][];
}

export type YabOptions = YabInternalOptions & Omit<Serve, "modules" | "fetch">;
