import type { UseModule } from "@vermi/core";
import {
	type SlashedPath,
	StaticModule,
	type StaticModuleOptions,
} from "./StaticModule";

export const statics = (
	path: SlashedPath,
	options: StaticModuleOptions,
): UseModule<StaticModule, Record<SlashedPath, StaticModuleOptions>> => [
	StaticModule,
	{ [path]: options },
];
