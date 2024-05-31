import type { UseModule } from "@vermi/core";
import { HelmetModule, type HelmetOptions } from "./HelmetModule";

export const helmet = (config: HelmetOptions = {}): UseModule<HelmetModule> => [
	HelmetModule,
	config,
];
