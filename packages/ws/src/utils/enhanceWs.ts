import type { ServerWebSocket } from "bun";
import { type EventType, WsConnection, WsError, WsMessage } from "../events";

declare module "bun" {
	interface ServerWebSocket<T> {
		sendError(error: Error): void;
		sendMessage(message: Uint8Array): void;
		inform: (type: EventType) => void;
	}
}

export const enhanceWs = (ws: ServerWebSocket<any>) => {
	ws.sendError = (error: Error) => {
		ws.send(new WsError(ws.data.sid, error).pack());
	};
	ws.sendMessage = (message: Uint8Array) => {
		ws.send(new WsMessage(ws.data.sid, "/", "message", message).pack());
	};
	ws.inform = (type: EventType) => {
		ws.send(new WsConnection(ws.data.sid, type).pack());
	};
	return ws;
};
