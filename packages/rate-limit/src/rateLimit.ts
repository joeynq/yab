import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <M extends AdapterMap, N extends keyof M>(
	adapter: N,
	options: RateLimitConfig<M, N>["options"],
): UseModule<Class<RateLimitModule<M, N, any>>, RateLimitConfig<M, N>> => ({
	module: RateLimitModule,
	args: { adapter, options },
});
