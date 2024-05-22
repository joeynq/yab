export type EventType = "message" | "opened" | "closed" | "error";

export abstract class WsEvent {
	protected timestamp = new Date();

	constructor(
		protected sid: string,
		protected type: EventType,
	) {}

	abstract pack(): Uint8Array;
}
