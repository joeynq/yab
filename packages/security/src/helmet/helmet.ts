import type { YabUse } from "@yab/core";
import type { AnyClass } from "../../../utils/dist";
import { HelmetModule, type HelmetOptions } from "./HelmetModule";

export const helmet = (
	config: HelmetOptions = {},
): YabUse<AnyClass<HelmetModule>> => ({
	module: HelmetModule,
	args: [config],
});
