import { encode } from "@msgpack/msgpack";
import { WsEvent } from "./WsEvent";

export class WsConnection extends WsEvent {
	pack() {
		return encode({
			sid: this.sid,
			type: this.type,
			timestamp: this.timestamp,
		});
	}
}
