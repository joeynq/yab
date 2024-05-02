import type { TObject, TProperties } from "@sinclair/typebox";
import type { RequestContext } from "@yab/core";

export enum RouterEvent {
	Init = "router:init",
	BeforeRoute = "router:beforeRoute",
	AfterRoute = "router:afterRoute",
	Validate = "router:validate",
}

export type RouterEventMap = {
	[RouterEvent.Init]: (context: RequestContext) => Promise<void>;
	[RouterEvent.BeforeRoute]: (context: RequestContext) => Promise<void>;
	[RouterEvent.AfterRoute]: <T = unknown>(
		context: RequestContext,
		result: T,
	) => Promise<void>;
	[RouterEvent.Validate]: <T extends TProperties>(
		schema: TObject<T>,
		payload: any,
	) => Promise<void>;
};
