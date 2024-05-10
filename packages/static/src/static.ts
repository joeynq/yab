import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import {
	type SlashedPath,
	StaticModule,
	type StaticModuleOptions,
} from "./StaticModule";

export const statics = (
	path: SlashedPath,
	options: Omit<StaticModuleOptions, "prefix">,
): YabUse<AnyClass<StaticModule>> => ({
	module: StaticModule,
	args: [
		{
			...options,
			prefix: path,
		},
	],
});
