import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { RouterModule, type RouterOptions } from "./RouterModule";
import type { SlashedPath } from "./interfaces";

export const router = (
	prefix: SlashedPath,
	controllers: Class<any>[],
	options?: RouterOptions,
): UseModule<RouterModule> => [
	RouterModule,
	{ [prefix]: { controllers, options } },
];
