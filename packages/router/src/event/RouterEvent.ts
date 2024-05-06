import type { RequestContext } from "@yab/core";

export enum RouterEvent {
	Init = "router:init",
	BeforeRoute = "router:beforeRoute",
	AfterRoute = "router:afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.Init]: (context: RequestContext) => Promise<void>;
	[RouterEvent.BeforeRoute]: (context: RequestContext) => Promise<void>;
	[RouterEvent.AfterRoute]: <T = unknown>(
		context: RequestContext,
		result: T,
	) => Promise<void>;
};
