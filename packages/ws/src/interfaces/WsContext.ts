import type { ExposedContext, _AppContext } from "@vermi/core";
import type { WsMessage } from "../events";
import type { WsData } from "./WsData";

export interface _WsContext<
	Params extends Record<string, string> = Record<string, string>,
> extends _AppContext {
	data: WsData;
	params: Params;
	event?: WsMessage<any>;
	send: (message: Uint8Array) => void;
	broadcast: (message: Uint8Array) => void;
}

export type WsContext<
	Params extends Record<string, string> = Record<string, string>,
> = ExposedContext<_WsContext<Params>>;
