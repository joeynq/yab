import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	RouterModule,
	type RouterModuleConfig,
	type RouterOptions,
} from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	prefix: SlashedPath,
	controllers: Class<any>[],
	options?: RouterOptions,
): UseModule<Class<RouterModule>, RouterModuleConfig> => ({
	module: RouterModule,
	args: { [prefix]: { controllers, options } },
});
