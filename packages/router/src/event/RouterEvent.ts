import type { Context } from "@yab/core";

export enum RouterEvent {
	BeforeRoute = "beforeRoute",
	AfterRoute = "afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.BeforeRoute]: (context: Context) => Promise<void>;
	[RouterEvent.AfterRoute]: (
		context: Context,
		result: unknown,
	) => Promise<void>;
};
