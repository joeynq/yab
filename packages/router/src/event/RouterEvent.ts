import type { RequestContext } from "@yab/core";

export enum RouterEvent {
	BeforeRoute = "router:beforeRoute",
	AfterRoute = "router:afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.BeforeRoute]: (context: RequestContext) => Promise<void>;
	[RouterEvent.AfterRoute]: <T = unknown>(
		context: RequestContext,
		result: T,
	) => Promise<void>;
};
