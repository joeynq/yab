import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	type SlashedPath,
	StaticModule,
	type StaticModuleOptions,
} from "./StaticModule";

export const statics = (
	path: SlashedPath,
	options: StaticModuleOptions,
): UseModule<
	Class<StaticModule>,
	Record<SlashedPath, StaticModuleOptions>
> => ({
	module: StaticModule,
	args: { [path]: options },
});
