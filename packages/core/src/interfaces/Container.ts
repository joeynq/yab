import type { AnyClass, Dictionary, MaybePromiseFunction } from "@vermi/utils";
import type { AwilixContainer } from "awilix";
import type { SocketAddress } from "bun";
import type { Vermi } from "../Vermi";
import type { Configuration, Hooks } from "../services";
import type { LoggerAdapter } from "./LoggerAdapter";

export type InjectionToken<T> = string | (new (...args: any[]) => T);

export enum InjectionScope {
	Singleton = "SINGLETON",
	Transient = "TRANSIENT",
	Scoped = "SCOPED",
}

export interface EnhancedContainer<Context extends object>
	extends AwilixContainer<Context> {
	registerValue<T>(token: InjectionToken<T>, value: AnyClass<T>): void;
	registerValue<T>(
		token: InjectionToken<T>,
		value: T,
		scope?: InjectionScope,
	): void;

	resolveValue<T>(token: InjectionToken<T>): T;

	isRegistered<T>(token: InjectionToken<T>): boolean;

	expose(): ExposedContext<Context>;

	createEnhancedScope<T>(): EnhancedContainer<Context & T>;
}

export interface _AppContext {
	env: Dictionary<unknown>;
	app: Vermi;
	logger: LoggerAdapter;
	hooks: Hooks<Dictionary<string>, Dictionary<MaybePromiseFunction>>;
	configuration: Configuration;
	[key: string]: unknown;
}

export interface _RequestContext extends _AppContext {
	request: Request;
	requestId: string;
	serverUrl: string;
	userIp?: SocketAddress;
	userAgent?: string;
}

export type ExposedContext<Context extends object = _RequestContext> = {
	store: Context;
	resolve: EnhancedContainer<Context>["resolveValue"];
	register: AwilixContainer<Context>["register"];
	build: AwilixContainer<Context>["build"];
};

export type AppContext = ExposedContext<_AppContext>;

export type RequestContext = ExposedContext<_RequestContext>;
