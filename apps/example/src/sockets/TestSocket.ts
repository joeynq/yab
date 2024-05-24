import { Logger, type LoggerAdapter } from "@vermi/core";
import { OnMessage, SocketController, type WsContext } from "@vermi/ws";

@SocketController("/test")
export class TestSocket {
	@Logger()
	logger!: LoggerAdapter;

	@OnMessage("some-message")
	async onMessage(context: WsContext, message: Uint8Array) {
		this.logger.info(context.store.data, "some-message");
	}
}
