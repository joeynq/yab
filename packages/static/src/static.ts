import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import {
	type SlashedPath,
	StaticModule,
	type StaticModuleOptions,
} from "./StaticModule";

export const statics = (
	path: SlashedPath,
	options: Omit<StaticModuleOptions, "prefix">,
): UseModule<AnyClass<StaticModule>> => ({
	module: StaticModule,
	args: [
		{
			...options,
			prefix: path,
		},
	],
});
