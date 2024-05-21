import type { Server, ServerWebSocket } from "bun";

type Membership = "invited" | "joined";

export interface _WsContext {
	readonly server: Server;
	readonly socket: ServerWebSocket;
	readonly isAlive: boolean;
	readonly openedAt: number;
	userId?: string;
	memberships: Map<string, Membership>;
}

export interface _RoomContext extends _WsContext {
	readonly channel: string;
	membership: Membership;
	members: Map<string, Membership>;
}
