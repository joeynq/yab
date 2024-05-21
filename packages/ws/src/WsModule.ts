import {
	type AppContext,
	AppHook,
	Configuration,
	type LoggerAdapter,
	Module,
	VermiModule,
} from "@vermi/core";
import type { WebSocketHandler } from "bun";
import { OnConnect } from "./events/OnConnect";

declare module "@vermi/core" {
	interface AppOptions {
		websocket?: WebSocketHandler;
	}
}

export interface WsModuleOptions {
	/**
	 * Sets the maximum size of messages in bytes.
	 *
	 * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
	 */
	maxPayloadLength?: number;

	/**
	 * Sets the maximum number of bytes that can be buffered on a single connection.
	 *
	 * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
	 */
	backpressureLimit?: number;

	/**
	 * Sets if the connection should be closed if `backpressureLimit` is reached.
	 *
	 * Default is `false`.
	 */
	closeOnBackpressureLimit?: boolean;

	/**
	 * Sets the the number of seconds to wait before timing out a connection
	 * due to no messages or pings.
	 *
	 * Default is 2 minutes, or `120` in seconds.
	 */
	idleTimeout?: number;

	/**
	 * Should `ws.publish()` also send a message to `ws` (itself), if it is subscribed?
	 *
	 * Default is `false`.
	 */
	publishToSelf?: boolean;

	/**
	 * Should the server automatically send and respond to pings to clients?
	 *
	 * Default is `true`.
	 */
	sendPings?: boolean;
}

@Module()
export class WsModule extends VermiModule<WsModuleOptions> {
	constructor(
		protected configuration: Configuration,
		protected logger: LoggerAdapter,
	) {
		super();
	}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		const websocketHandler: WebSocketHandler = {
			message(ws, message) {},
			open(ws) {
				const onConnect = new OnConnect("app", null);
				ws.send(onConnect.toString());
			},
			close(ws, code, reason) {},
			...this.config,
		};
		this.configuration.options.websocket = websocketHandler;
	}
}
