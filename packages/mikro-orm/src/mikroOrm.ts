import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import { MikroOrmModule, type MikroOrmModuleConfig } from "./MikroOrmModule";

export const mikroOrm = (
	config: MikroOrmModuleConfig,
): UseModule<AnyClass<MikroOrmModule>> => ({
	module: MikroOrmModule,
	args: [config],
});
