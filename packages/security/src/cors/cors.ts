import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { type CorsConfig, CorsModule } from "./CorsModule";

export const cors = (
	options: CorsConfig = {},
): YabUse<AnyClass<CorsModule>> => ({
	module: CorsModule,
	args: [options],
});
