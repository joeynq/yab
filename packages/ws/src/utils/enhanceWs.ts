import type { ServerWebSocket } from "bun";
import { type EventType, WsError, WsEvent } from "../events";
import type { WsData } from "../interfaces";
import type { Parser } from "../parser/Parser";

export interface EnhancedWebSocket<T> extends ServerWebSocket<T> {
	sendEvent(type: "error", data: Error): void;
	sendEvent<Data>(type: Exclude<EventType, "error">, data?: Data): void;
}

export const enhanceWs = (
	_ws: ServerWebSocket<WsData>,
	parser: Parser,
): EnhancedWebSocket<WsData> => {
	const ws = _ws as EnhancedWebSocket<WsData>;

	function sendEvent<Data>(type: EventType, data?: Data) {
		const { sid } = ws.data;

		const event =
			type === "error"
				? new WsError(sid, data as Error)
				: new WsEvent(sid, type, data);

		ws.send(parser.encode(event.toDTO()));
	}

	ws.sendEvent = sendEvent;

	return ws;
};
