import type { RequestContext } from "@vermi/core";
import type { FindResult } from "memoirist";
import type { RouteMatch } from "../interfaces";

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

	[RouterEvent.RouteGuard]: (
		context: RequestContext,
		route: FindResult<RouteMatch>,
	) => Promise<void>;

	[RouterEvent.BeforeHandle]: (
		context: RequestContext,
		route: FindResult<RouteMatch>,
	) => Promise<void>;

	[RouterEvent.AfterHandle]: <T>(
		context: RequestContext,
		result: T,
		route: FindResult<RouteMatch>,
	) => Promise<void>;

	[RouterEvent.AfterRoute]: (
		context: RequestContext,
		response?: Response,
	) => Promise<void>;
};
