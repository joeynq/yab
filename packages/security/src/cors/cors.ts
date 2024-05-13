import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { type CorsConfig, CorsModule } from "./CorsModule";

export const cors = (
	options: CorsConfig = {},
): UseModule<Class<CorsModule>, CorsConfig> => ({
	module: CorsModule,
	args: options,
});
