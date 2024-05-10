import { Logger, type LoggerAdapter, type RequestContext } from "@vermi/core";
import { After, Before, Middleware } from "@vermi/router";

@Middleware()
export class AnyMiddleware {
	@Logger()
	logger!: LoggerAdapter;

	@Before()
	public mwBefore(ctx: RequestContext) {
		this.logger.info("Before");
	}

	@After()
	public mwAfter(ctx: RequestContext) {
		this.logger.info("After");
	}
}
