import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { MikroOrmModule, type MikroOrmModuleConfig } from "./MikroOrmModule";

export const mikroOrm = (
	config: MikroOrmModuleConfig,
): YabUse<AnyClass<MikroOrmModule>> => ({
	module: MikroOrmModule,
	args: [config],
});
