import type { Server } from "bun";
import type { Context, EnhancedContainer } from "../interfaces";
import type { Configuration } from "../services";

export enum YabEvents {
	OnStarted = "app:started",
	OnRequest = "app:request",
	OnInit = "app:init",
}

export type YabEventMap = {
	[YabEvents.OnStarted]: [Server, Configuration];
	[YabEvents.OnInit]: [
		{
			config: Configuration;
			container: EnhancedContainer;
		},
	];
	[YabEvents.OnRequest]: [Context];
};
