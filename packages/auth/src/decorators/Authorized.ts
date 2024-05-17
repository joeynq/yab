import {
	Logger,
	type LoggerAdapter,
	type RequestContext,
	asValue,
	useDecorators,
} from "@vermi/core";
import {
	BadRequest,
	Before,
	Middleware,
	Unauthorized,
	Use,
	routeStore,
} from "@vermi/router";

@Middleware()
class AuthorizedMiddleware {
	@Logger()
	logger!: LoggerAdapter;

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
	return useDecorators(Use(AuthorizedMiddleware), (target, propertyKey) => {
		const store = routeStore.apply((target as any).constructor);
		const path = store.findPath((target as any).constructor, propertyKey);

		if (!path) return;

		store.updateRoute(path, (current) => {
			if (!current.security) {
				current.security = new Map();
			}
			current.security.set(scheme, scopes);

			current.responses?.set(401, {
				content: new Map([
					[
						"application/json",
						{
							schema: new Unauthorized("").toSchema(),
						},
					],
				]),
			});

			current.responses?.set(403, {
				content: new Map([
					[
						"application/json",
						{
							schema: new BadRequest("").toSchema(),
						},
					],
				]),
			});

			return current;
		});
	});
};
