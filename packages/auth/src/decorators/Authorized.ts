import {
	Logger,
	type LoggerAdapter,
	type RequestContext,
	asValue,
	useDecorators,
} from "@vermi/core";
import {
	Before,
	Middleware,
	Unauthorized,
	Use,
	routeStore,
} from "@vermi/router";

@Middleware()
class AuthorizedMiddleware {
	@Logger() logger!: LoggerAdapter;

	@Before()
	public async authorize<T>(ctx: RequestContext) {
		const { payload } = await ctx.store.verifyToken<T>();

		if (!payload.sub) {
			this.logger.error("Unauthorized request");
			throw new Unauthorized("Unauthorized request");
		}

		ctx.register("userId", asValue(payload.sub));
	}
}

export const Authorized = (scheme: string, scopes: string[] = []) => {
	return useDecorators(
		Use(AuthorizedMiddleware),
		(target: any, propertyKey) => {
			const store = routeStore.apply(target.constructor);
			const path = store.findPath(propertyKey);

			if (!path) return;

			store.updateRoute(path, (current) => {
				if (!current.security) {
					current.security = new Map();
				}
				current.security.set(scheme, scopes);

				return current;
			});
		},
	);
};
