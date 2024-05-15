import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { HelmetModule, type HelmetOptions } from "./HelmetModule";

export const helmet = (
	config: HelmetOptions = {},
): UseModule<Class<HelmetModule>, HelmetOptions> => ({
	module: HelmetModule,
	args: config,
});
