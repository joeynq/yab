import type { UseModule } from "@vermi/core";
import { type CorsConfig, CorsModule } from "./CorsModule";

export const cors = (options: CorsConfig = {}): UseModule<CorsModule> => [
	CorsModule,
	options,
];
