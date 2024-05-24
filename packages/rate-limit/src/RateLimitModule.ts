import {
	type AppContext,
	AppHook,
	Config,
	HttpException,
	Module,
	type RequestContext,
	type VermiModule,
	asValue,
} from "@vermi/core";
import { TooManyRequests } from "@vermi/router";
import type { Class } from "@vermi/utils";
import {
	type RateLimiterAbstract,
	RateLimiterDynamo,
	RateLimiterMemcache,
	RateLimiterMemory,
	RateLimiterMongo,
	RateLimiterMySQL,
	RateLimiterPostgres,
	RateLimiterPrisma,
	RateLimiterRedis,
	type RateLimiterRes,
} from "rate-limiter-flexible";

const adapterMap = {
	redis: RateLimiterRedis,
	memory: RateLimiterMemory,
	dynamo: RateLimiterDynamo,
	memcache: RateLimiterMemcache,
	postgres: RateLimiterPostgres,
	mongo: RateLimiterMongo,
	mysql: RateLimiterMySQL,
	prisma: RateLimiterPrisma,
} as const;

export type AdapterMap = typeof adapterMap;

export type RateLimitConfig<M extends typeof adapterMap, N extends keyof M> = {
	adapter: N;
	options: ConstructorParameters<Class<M[N]>>[0];
};

declare module "@vermi/core" {
	interface _RequestContext {
		rateLimit: RateLimiterRes;
	}

	interface _AppContext {
		rateLimitHandler: (context: RequestContext) => Promise<RateLimiterRes>;
	}
}

@Module()
export class RateLimitModule<
	M extends typeof adapterMap,
	N extends keyof M,
	RateLimiter extends RateLimiterAbstract,
> implements VermiModule<RateLimitConfig<M, N>>
{
	#rateLimiter: RateLimiter;

	@Config() public config!: RateLimitConfig<M, N>;

	constructor() {
		const { adapter, options } = this.config;
		this.#rateLimiter = new (adapterMap as any)[adapter](options);
	}

	async #handle(context: RequestContext) {
		try {
			const ip = context.store.userIp;

			if (!ip) {
				throw new Error("IP address not found");
			}

			return this.#rateLimiter.consume(ip.address, 1);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new TooManyRequests("Rate limit exceeded", error as Error);
		}
	}

	@AppHook("app:init")
	async rateLimitInit(context: AppContext) {
		context.register({
			rateLimitHandler: asValue(this.#handle.bind(this)),
		});
	}

	@AppHook("app:request")
	async rateLimitHook(ctx: RequestContext) {
		const limit = await this.#handle(ctx);
		ctx.register({ rateLimit: asValue(limit) });
	}

	@AppHook("app:response")
	async corsHook(context: RequestContext, response: Response) {
		const limit = context.resolve<RateLimiterRes>("rateLimit");

		response.headers.set("Retry-After", (limit.msBeforeNext / 1000).toString());
		response.headers.set(
			"X-RateLimit-Limit",
			this.config.options.points.toString(),
		);
		response.headers.set(
			"X-RateLimit-Remaining",
			limit.remainingPoints.toString(),
		);
		response.headers.set(
			"X-RateLimit-Reset",
			new Date(Date.now() + limit.msBeforeNext).toISOString(),
		);

		return response;
	}
}
