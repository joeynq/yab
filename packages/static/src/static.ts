import type { YabUse } from "@yab/core";
import type { AnyClass } from "../../utils/dist";
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
