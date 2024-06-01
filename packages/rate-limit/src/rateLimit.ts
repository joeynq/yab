import type { UseModule } from "@vermi/core";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <N extends keyof AdapterMap>(
	adapter: N,
	options: RateLimitConfig<N>["options"],
): UseModule<RateLimitModule<N>> => [RateLimitModule, { adapter, options }];
