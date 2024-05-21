import { type ExtractParams, uuid } from "@vermi/utils";

export interface EventOptions {
	auth?: string;
	invoker?: string;
}

export abstract class WsEvent<Payload, Channel extends string = string> {
	readonly eventID = uuid();

	// request ID if event is triggered by a request
	invoker?: string;

	// E.g. { id: 1 }
	readonly params!: ExtractParams<Channel>;

	// name of the event
	abstract readonly event: string;

	// E.g. `Bearer ${token}`
	auth?: string;

	// timestamp of the event
	readonly timestamp = new Date();

	constructor(
		public readonly channel: Channel,
		public readonly data: Payload,
		options?: EventOptions,
	) {
		this.auth = options?.auth;
		this.invoker = options?.invoker;
	}

	toString() {
		return JSON.stringify({
			eventID: this.eventID,
			channel: this.channel,
			event: this.event,
			timestamp: this.timestamp,
			invoker: this.invoker,
			data: this.data,
		});
	}
}
