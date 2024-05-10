import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <M extends AdapterMap, N extends keyof M>(
	adapter: N,
	options: RateLimitConfig<M, N>["options"],
): UseModule<AnyClass<RateLimitModule<M, N, any>>> => ({
	module: RateLimitModule,
	args: [{ adapter, options }],
});
