import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import { type CorsConfig, CorsModule } from "./CorsModule";

export const cors = (
	options: CorsConfig = {},
): UseModule<AnyClass<CorsModule>> => ({
	module: CorsModule,
	args: [options],
});
