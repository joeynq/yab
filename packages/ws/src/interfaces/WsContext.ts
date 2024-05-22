import type { _AppContext } from "@vermi/core";
import type { Server, ServerWebSocket } from "bun";

export interface _WsContext extends _AppContext {
	readonly server: Server;
	readonly socket: ServerWebSocket;
	readonly isAlive: boolean;
	readonly openedAt: number;
	userId?: string;
}
