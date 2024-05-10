import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { RouterModule, type RouterOptions } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	prefix: SlashedPath,
	controllers: AnyClass<any>[],
	options?: RouterOptions,
): YabUse<AnyClass<RouterModule>> => ({
	module: RouterModule,
	args: [prefix, controllers, options],
});
