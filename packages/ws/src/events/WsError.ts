import { WsEvent } from "./WsEvent";

export class WsError<Err extends Error> extends WsEvent<Err> {
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

	toDTO() {
		return {
			...super.toDTO(),
			error: {
				message: this.message,
				stack: this.stack,
			},
		};
	}
}
