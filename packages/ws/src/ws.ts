import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { WsModule, type WsModuleOptions } from "./WsModule";

export const ws = (
	config: WsModuleOptions,
): UseModule<Class<WsModule>, WsModuleOptions> => ({
	module: WsModule,
	args: config,
});
