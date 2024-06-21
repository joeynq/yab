import type { UseModule } from "@vermi/core";
import { WsModule, type WsModuleOptions } from "./WsModule";

export const ws = (config: WsModuleOptions): UseModule<WsModule> => [
	WsModule,
	[config],
];
