import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <N extends keyof AdapterMap>(
	adapter: N,
	options: RateLimitConfig<N>["options"],
): UseModule<Class<RateLimitModule<N>>, RateLimitConfig<N>> => ({
	module: RateLimitModule,
	args: { adapter, options },
});
