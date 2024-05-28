import type { ExposedContext, _RequestContext } from "@vermi/core";
import type { ServerWebSocket } from "bun";
import type { EventType } from "../events";

export interface _WsContext extends _RequestContext {
	ws: ServerWebSocket<any>;

	broadcast(type: "error", data: Error): void;
	broadcast<Data>(type: Exclude<EventType, "error">, data: Data): void;

	sendTopic(topic: string, type: "error", data: Error): void;
	sendTopic<Data>(
		topic: string,
		type: Exclude<EventType, "error">,
		data: Data,
	): void;
}

export type WsContext = ExposedContext<_WsContext>;
