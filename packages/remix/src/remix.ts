import type { UseModule } from "@vermi/core";
import { RemixModule, type RemixModuleOptions } from "./RemixModule";

export const remix = (options: RemixModuleOptions): UseModule<RemixModule> => [
	RemixModule,
	options,
];
