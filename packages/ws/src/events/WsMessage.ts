import { type EventType, WsEvent } from "./WsEvent";

export interface EventOptions {
	auth?: string;
	invoker?: string;
}

export interface Pack<Payload> extends EventOptions {
	id: string;
	type: EventType;
	topic: `/${string}`;
	event: string;
	data: Payload;
	timestamp: Date;
}

export class WsMessage<Payload> extends WsEvent<Payload> {
	constructor(
		sid: string,
		public event: string,
		public topic: `/${string}` = "/",
		public data?: Payload,
	) {
		super(sid, "data");
	}

	toDTO() {
		return {
			...super.toDTO(),
			topic: this.topic,
			event: this.event,
		};
	}
}
