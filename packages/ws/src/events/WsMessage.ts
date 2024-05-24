import { decode, encode } from "@msgpack/msgpack";
import { type ExtractParams } from "@vermi/utils";
import { type EventType, WsEvent } from "./WsEvent";

// const encode = (data: any) => Buffer.from(JSON.stringify(data));
// const decode = (data: Uint8Array) => JSON.parse(data.toString());

export interface EventOptions {
	auth?: string;
	invoker?: string;
}

export interface Pack<Payload, Channel extends `/${string}` = "/">
	extends EventOptions {
	id: string;
	type: EventType;
	event: string;
	channel: Channel;
	params: ExtractParams<Channel>;
	data: Payload;
	timestamp: Date;
}

export class WsMessage<
	Payload,
	Channel extends `/${string}` = "/",
> extends WsEvent {
	invoker?: string;

	readonly params!: ExtractParams<Channel>;

	constructor(
		sid: string,
		public readonly channel: Channel,
		public readonly event: string,
		public readonly data: Payload,
		options?: EventOptions,
	) {
		super(sid, "message");
		this.invoker = options?.invoker;
	}

	pack() {
		return encode({
			sid: this.sid,
			type: this.type,
			event: this.event,
			channel: this.channel,
			params: this.params,
			data: this.data,
			timestamp: this.timestamp,
		});
	}

	static unpack(sid: string, packed: Buffer | string) {
		const { channel, data, event, auth, invoker } = decode(
			Buffer.from(packed),
		) as Pack<any, any>;
		return new WsMessage(sid, channel, event, data, {
			auth: auth,
			invoker: invoker,
		});
	}
}
