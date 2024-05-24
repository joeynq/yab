import type { AppContext } from "@vermi/core";

export enum WsHookEvents {
	Init = "ws-hook:init",
	Connect = "ws-hook:connect",
	Disconnect = "ws-hook:disconnect",
	Guard = "ws-hook:guard",
}

export type WsHookEventMap = {
	[WsHookEvents.Init]: (context: AppContext) => void;
	[WsHookEvents.Connect]: (context: AppContext) => void;
	[WsHookEvents.Guard]: (context: AppContext) => void;
	[WsHookEvents.Disconnect]: (
		context: AppContext,
		code: number,
		reason: string,
	) => void;
};
