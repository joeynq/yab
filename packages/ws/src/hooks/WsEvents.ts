import type { RequestContext } from "@vermi/core";
import type { Dictionary } from "@vermi/utils";
import type { WsContext } from "../interfaces";
import type { WsHandler } from "../stores";

export enum WsEvents {
	InitEvent = "ws-hook:initEvent",
	AfterEvent = "ws-hook:afterEvent",
	Handshake = "ws-hook:handshake",
	Subscribe = "ws-hook:subscribe",
	Unsubscribe = "ws-hook:unsubscribe",
	Guard = "ws-hook:guard",
}

export type WsEventMap = {
	[WsEvents.Handshake]: (
		context: RequestContext,
		data: Dictionary<any>,
	) => Promise<void>;

	[WsEvents.Subscribe]: (context: WsContext, topic: string) => Promise<void>;

	[WsEvents.Unsubscribe]: (context: WsContext, topic: string) => Promise<void>;

	[WsEvents.Guard]: (
		context: WsContext,
		handlerData: WsHandler,
	) => Promise<void>;

	[WsEvents.InitEvent]: (context: WsContext) => Promise<void>;

	[WsEvents.AfterEvent]: (
		context: WsContext,
		handlerData: WsHandler,
	) => Promise<void>;
};
