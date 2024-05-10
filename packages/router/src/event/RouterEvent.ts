import type { RequestContext } from "@vermi/core";

export enum RouterEvent {
	Init = "router:init",
	RouteGuard = "router:routeGuard",
	BeforeRoute = "router:beforeRoute",
	AfterRoute = "router:afterRoute",
	BeforeHandle = "router:beforeHandle",
	AfterHandle = "router:afterHandle",
}

export type RouterEventMap = {
	[RouterEvent.Init]: (context: RequestContext) => Promise<void>;

	[RouterEvent.BeforeRoute]: (context: RequestContext) => Promise<void>;

	// [RouterEvent.RouteGuard]: (
	// 	context: RequestContext,
	// 	route: RouteMatch,
	// ) => Promise<void>;

	// [RouterEvent.BeforeHandle]: (
	// 	context: RequestContext,
	// 	route: RouteMatch,
	// ) => Promise<void>;

	// [RouterEvent.AfterHandle]: <T>(
	// 	context: RequestContext,
	// 	result: T,
	// 	route: RouteMatch,
	// ) => Promise<void>;

	[RouterEvent.AfterRoute]: (
		context: RequestContext,
		response?: Response,
	) => Promise<void>;
};
