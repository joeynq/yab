import { Logger, type LoggerAdapter, type RequestContext } from "@yab/core";
import { After, Before, Middleware } from "@yab/router";

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
