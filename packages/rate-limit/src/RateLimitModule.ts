import {
	type AppContext,
	HttpException,
	Module,
	type RequestContext,
	YabHook,
	YabModule,
	asValue,
} from "@yab/core";
import { TooManyRequests } from "@yab/router";
import type { AnyClass } from "@yab/utils";
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
	options: ConstructorParameters<AnyClass<M[N]>>[0];
};

declare module "@yab/core" {
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
> extends YabModule<RateLimitConfig<M, N>> {
	#rateLimiter: RateLimiter;

	constructor(public config: RateLimitConfig<M, N>) {
		super();

		this.#rateLimiter = new (adapterMap as any)[config.adapter](config.options);
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

	@YabHook("app:init")
	async rateLimitInit(context: AppContext) {
		context.register({
			rateLimitHandler: asValue(this.#handle.bind(this)),
		});
	}

	@YabHook("app:request")
	async rateLimitHook(ctx: RequestContext) {
		const limit = await this.#handle(ctx);
		ctx.register({ rateLimit: asValue(limit) });
	}

	@YabHook("app:response")
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
