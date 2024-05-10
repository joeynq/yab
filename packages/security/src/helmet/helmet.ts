import type { UseModule } from "@vermi/core";
import type { AnyClass } from "../../../utils/dist";
import { HelmetModule, type HelmetOptions } from "./HelmetModule";

export const helmet = (
	config: HelmetOptions = {},
): UseModule<AnyClass<HelmetModule>> => ({
	module: HelmetModule,
	args: [config],
});
