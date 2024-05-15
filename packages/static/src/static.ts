import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	type SlashedPath,
	StaticModule,
	type StaticModuleOptions,
} from "./StaticModule";

export const statics = (
	path: SlashedPath,
	options: Omit<StaticModuleOptions, "prefix">,
): UseModule<Class<StaticModule>, StaticModuleOptions> => ({
	module: StaticModule,
	args: { ...options, prefix: path },
});
