import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { RouterModule } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	prefix: SlashedPath,
	controllers: AnyClass<any>[],
): YabUse<AnyClass<RouterModule>> => ({
	module: RouterModule,
	args: [prefix, controllers],
});
