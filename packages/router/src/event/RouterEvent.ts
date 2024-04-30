import type { Context } from "@yab/core";

export enum RouterEvent {
	BeforeRoute = "router:beforeRoute",
	AfterRoute = "router:afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.BeforeRoute]: (context: Context) => Promise<void>;
	[RouterEvent.AfterRoute]: <T = unknown>(
		context: Context,
		result: T,
	) => Promise<void>;
};
