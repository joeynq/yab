import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import { RouterModule, type RouterOptions } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	prefix: SlashedPath,
	controllers: AnyClass<any>[],
	options?: RouterOptions,
): UseModule<AnyClass<RouterModule>> => ({
	module: RouterModule,
	args: [prefix, controllers, options],
});
