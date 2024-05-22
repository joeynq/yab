import { encode } from "@msgpack/msgpack";
import { WsEvent } from "./WsEvent";

export class WsError<Err extends Error> extends WsEvent {
	get message() {
		return this.error.message;
	}

	get stack() {
		return this.error.stack;
	}

	constructor(
		sid: string,
		protected error: Err,
	) {
		super(sid, "error");
	}
	pack() {
		return encode({
			sid: this.sid,
			type: this.type,
			timestamp: this.timestamp,
			message: this.message,
			stack: this.stack,
		});
	}
}
