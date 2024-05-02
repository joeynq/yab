import type { Server } from "bun";
import type { Yab } from "../Yab";
import type { Context, EnhancedContainer } from "../interfaces";
import type { Configuration } from "../services";

export enum YabEvents {
	OnExit = "app:exit",
	OnStarted = "app:started",
	OnRequest = "app:request",
	OnResponse = "app:response",
	OnInit = "app:init",
}

export interface InitContext {
	config: Configuration;
	container: EnhancedContainer;
	app: Yab;
}

export type YabEventMap = {
	[YabEvents.OnExit]: (server: Server) => Promise<void>;
	[YabEvents.OnStarted]: (
		server: Server,
		config: Configuration,
	) => Promise<void>;
	[YabEvents.OnInit]: (initContext: InitContext) => Promise<void>;
	[YabEvents.OnRequest]: (context: Context) => Promise<Response>;
	[YabEvents.OnResponse]: (
		context: Context,
		response: Response,
	) => Promise<Response>;
};
