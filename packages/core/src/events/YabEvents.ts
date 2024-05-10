import type { Server } from "bun";
import type { AppContext, RequestContext } from "../interfaces";

export enum YabEvents {
	OnExit = "app:exit",
	OnStarted = "app:started",
	OnEnterContext = "app:enter-context",
	OnExitContext = "app:exit-context",
	OnRequest = "app:request",
	OnResponse = "app:response",
	OnInit = "app:init",
}

export type YabEventMap = {
	[YabEvents.OnExit]: (context: AppContext, server: Server) => Promise<void>;

	[YabEvents.OnStarted]: (context: AppContext, server: Server) => Promise<void>;

	[YabEvents.OnEnterContext]: (context: RequestContext) => Promise<void>;

	[YabEvents.OnExitContext]: (context: RequestContext) => Promise<void>;

	[YabEvents.OnInit]: (context: AppContext) => Promise<void>;

	[YabEvents.OnRequest]: (context: RequestContext) => Promise<Response>;

	[YabEvents.OnResponse]: (
		context: RequestContext,
		response: Response,
	) => Promise<Response>;
};
