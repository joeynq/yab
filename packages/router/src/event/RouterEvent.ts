import type { RequestContext } from "@vermi/core";

export enum RouterEvent {
	Match = "router:match",
	BeforeRoute = "router:beforeRoute",
	Guard = "router:routeGuard",
	BeforeHandle = "router:beforeHandle",
	AfterHandle = "router:afterHandle",
	AfterRoute = "router:afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.Match]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvent.BeforeRoute]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvent.Guard]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvent.BeforeHandle]: (
		context: RequestContext,
	) => Promise<Response | undefined>;

	[RouterEvent.AfterHandle]: <T>(
		context: RequestContext,
		result: T | undefined,
	) => Promise<Response | T | undefined>;

	[RouterEvent.AfterRoute]: (
		context: RequestContext,
		response?: Response,
	) => Promise<Response | undefined>;
};
