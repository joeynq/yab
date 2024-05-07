import type { Dictionary } from "@yab/utils";
import type { _RequestContext } from "./Container";

export type LogLevel =
	| "info"
	| "error"
	| "warn"
	| "debug"
	| "trace"
	| "fatal"
	| "silent";

export type LoggerContext = Pick<
	_RequestContext,
	"requestId" | "serverUrl" | "userIp" | "userAgent"
>;

export interface LogOptions<Logger extends Dictionary | object | never> {
	context?: LoggerContext;
	noColor: boolean;
	level: LogLevel;
	stackTrace: boolean;
	options: Logger extends Dictionary ? Logger : never;
}

export interface LogFn {
	<T extends object>(obj: T, msg?: string, ...args: any[]): void;
	(obj: unknown, msg?: string, ...args: any[]): void;
	(msg: string, ...args: any[]): void;
}

export interface LoggerAdapter<Logger = any> {
	log: Logger;
	level: LogLevel;

	createChild(context: LoggerContext): LoggerAdapter<Logger>;

	/**
	 * Write a 'log' level log.
	 */
	info: LogFn;

	/**
	 * Write an 'error' level log.
	 */
	error: LogFn;

	/**
	 * Write a 'warn' level log.
	 */
	warn: LogFn;

	/**
	 * Write a 'debug' level log.
	 */
	debug: LogFn;

	trace: LogFn;
}
