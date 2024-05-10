import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <M extends AdapterMap, N extends keyof M>(
	adapter: N,
	options: RateLimitConfig<M, N>["options"],
): YabUse<AnyClass<RateLimitModule<M, N, any>>> => ({
	module: RateLimitModule,
	args: [{ adapter, options }],
});
