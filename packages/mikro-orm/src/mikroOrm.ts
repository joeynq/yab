import type { UseModule } from "@vermi/core";
import { MikroOrmModule, type MikroOrmModuleConfig } from "./MikroOrmModule";

export const mikroOrm = (
	config: MikroOrmModuleConfig,
): UseModule<MikroOrmModule> => [MikroOrmModule, config];
