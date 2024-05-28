import type { RequestContext } from "@vermi/core";
import type { WsContext, WsData } from "../interfaces";

export enum WsEvents {
	Handshake = "ws-hook:handshake",
	Subscribe = "ws-hook:subscribe",
	Unsubscribe = "ws-hook:unsubscribe",
	Guard = "ws-hook:guard",
}

export type WsEventMap = {
	[WsEvents.Handshake]: <Data extends WsData>(
		context: RequestContext,
	) => Promise<Data>;

	[WsEvents.Subscribe]: (context: WsContext, topic: string) => Promise<void>;

	[WsEvents.Unsubscribe]: (context: WsContext, topic: string) => Promise<void>;

	[WsEvents.Guard]: (context: WsContext) => Promise<void>;
};
