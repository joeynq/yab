import {
	Logger,
	type LoggerAdapter,
	type RequestContext,
	asValue,
} from "@vermi/core";
import { Before, Middleware, Unauthorized, Use } from "@vermi/router";

@Middleware()
class AuthorizedMiddleware {
	@Logger()
	logger!: LoggerAdapter;

	@Before()
	public authorize(ctx: RequestContext) {
		return new Promise<void>((resolve, reject) => {
			ctx.store
				.verifyToken()
				.then(({ payload }) => {
					ctx.register({ userId: asValue(payload.sub) });
					resolve();
				})
				.catch((err) => {
					reject(new Unauthorized(err.message, err));
				});
		});
	}
}

export const Authorized = () => Use(AuthorizedMiddleware);
