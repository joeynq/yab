import type { Server } from "bun";
import type { Container } from "diod";
import type { Context } from "../interfaces/Context";
import type { Configuration } from "../services";

export enum YabEvents {
	OnStarted = "started",
	OnRequest = "onRequest",
	OnInit = "init",
}

export type YabEventMap = {
	[YabEvents.OnStarted]: [Server, Configuration];
	[YabEvents.OnInit]: [{ config: Configuration; container: Container }];
	[YabEvents.OnRequest]: [Context];
};
