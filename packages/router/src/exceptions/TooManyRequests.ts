import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

interface RateLimiterRes {
	limit: number;
	reset: number;
	remaining: number;
	retryAfter: number;
}

export class TooManyRequests extends RouterException {
	constructor(
		message: string,
		protected rateLimit: RateLimiterRes,
		cause?: Error,
	) {
		super(HttpErrorCodes.TooManyRequests, message, cause);
	}

	toJSON() {
		return {
			...super.toJSON(),
			rateLimit: this.rateLimit,
		};
	}
}
