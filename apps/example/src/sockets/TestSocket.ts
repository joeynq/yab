import { Logger, type LoggerAdapter } from "@vermi/core";
import { Model, Number, String } from "@vermi/schema";
import { Message, SocketController, Subscribe } from "@vermi/ws";

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

	@Subscribe("some-message")
	async onMessage(@Message() message: TestModel) {
		this.logger.info("some-message");
		this.logger.info(JSON.stringify(message));
	}
}
