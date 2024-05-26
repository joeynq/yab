export type EventType =
	// send to client
	| "error" // error event
	| "connect" // acknowledgement
	// receive from client
	| "subscribe" // subscription event
	| "unsubscribe" // subscription event
	// both
	| "data"; // data event

export class WsEvent<Data> {
	public timestamp = new Date();

	constructor(
		public sid: string,
		public type: EventType,
		public data?: Data,
	) {}

	toDTO() {
		return {
			sid: this.sid,
			type: this.type,
			data: this.data,
			timestamp: this.timestamp,
		};
	}
}
