import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { MikroOrmModule, type MikroOrmModuleConfig } from "./MikroOrmModule";

export const mikroOrm = (
	config: MikroOrmModuleConfig,
): UseModule<Class<MikroOrmModule>, MikroOrmModuleConfig> => ({
	module: MikroOrmModule,
	args: config,
});
