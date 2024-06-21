import type { UseModule } from "@vermi/core";
import { StaticModule, type StaticModuleOptions } from "./StaticModule";

export const statics = (
	assetsDir: string,
	options: Omit<StaticModuleOptions, "assetsDir">,
): UseModule<StaticModule, StaticModuleOptions[]> => [
	StaticModule,
	[{ ...options, assetsDir }],
];
