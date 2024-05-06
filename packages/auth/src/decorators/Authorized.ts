import {
	Logger,
	type LoggerAdapter,
	type RequestContext,
	asValue,
} from "@yab/core";
import { BeforeRoute, Middleware, Unauthorized, Use } from "@yab/router";

@Middleware()
class AuthorizedMiddleware {
	@Logger()
	logger!: LoggerAdapter;

	@BeforeRoute()
	public authorize(ctx: RequestContext) {
		return new Promise<void>((resolve, reject) => {
			ctx.store
				.verifyToken()
				.then(({ payload }) => {
					ctx.register({ userId: asValue(payload.sub) });
					resolve();
				})
				.catch((err) => {
					this.logger.error(err);
					reject(new Unauthorized(err.message));
				});
		});
	}
}

export const Authorized = () => Use(AuthorizedMiddleware);
