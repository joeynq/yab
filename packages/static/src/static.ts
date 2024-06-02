import type { UseModule } from "@vermi/core";
import { StaticModule, type StaticModuleOptions } from "./StaticModule";

export const statics = (
	assetsDir: string,
	options: StaticModuleOptions,
): UseModule<StaticModule, Record<string, StaticModuleOptions>> => [
	StaticModule,
	{ [assetsDir]: options },
];
