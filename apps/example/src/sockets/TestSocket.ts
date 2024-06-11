import { Logger, type LoggerAdapter } from "@vermi/core";
import { Model, Number, OnData, String } from "@vermi/schema";
import { SocketController, type WsContext } from "@vermi/ws";

@Model()
class TestModel {
	@String()
	foo!: string;

	@Number()
	bar!: number;
}

@SocketController("/test")
export class TestSocket {
	@Logger()
	logger!: LoggerAdapter;

	@OnData("some-message", TestModel)
	async onMessage(context: WsContext<{ "other-message": true }>, message: any) {
		this.logger.info("some-message");
		context.store.broadcast("other-message", message);
	}
}
