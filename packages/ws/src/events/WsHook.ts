import type { AppContext } from "@vermi/core";

export enum WsHookEvents {
	Connect = "ws-hook:connect",
	Disconnect = "ws-hook:disconnect",
	Guard = "ws-hook:guard",
}

export type WsHookEventMap = {
	[WsHookEvents.Connect]: (context: AppContext) => void;
	[WsHookEvents.Guard]: (context: AppContext) => void;
	[WsHookEvents.Disconnect]: (
		context: AppContext,
		code: number,
		reason: string,
	) => void;
};
