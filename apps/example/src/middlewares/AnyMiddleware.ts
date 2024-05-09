import type { RequestContext } from "@mikro-orm/core";
import { Logger, type LoggerAdapter } from "@yab/core";
import { After, Before, Middleware } from "@yab/router";

@Middleware()
export class AnyMiddleware {
	@Logger()
	logger!: LoggerAdapter;

	@Before()
	public mwBefore(ctx: RequestContext) {
		console.log(this.logger);
		// this.logger.info("Before route");
	}

	@After()
	public mwAfter(ctx: RequestContext) {
		// this.logger.info("After route");
	}
}
