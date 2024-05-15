import type { AnyFunction, Dictionary } from "@vermi/utils";
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

export interface LogOptions<Logger extends Dictionary | object> {
	context?: LoggerContext;
	noColor?: boolean;
	level?: LogLevel;
	stackTrace?: boolean;
	options?: Logger extends Dictionary | object ? Logger : never;
}

export interface LogFn {
	<T extends object>(obj: T, msg?: string, ...args: any[]): any;
	(obj: unknown, msg?: string, ...args: any[]): any;
	(msg: string, ...args: any[]): any;
}

export interface AbstractLogger {
	info: AnyFunction;
	error: AnyFunction;
	warn: AnyFunction;
	debug: AnyFunction;
	trace: AnyFunction;
}

export interface LoggerAdapter<Logger extends AbstractLogger = AbstractLogger> {
	log: Logger;
	level: LogLevel;
	context?: LoggerContext;

	useContext(context: LoggerContext): LoggerAdapter<Logger>;
	setLogger(logger: Logger): void;

	info: LogFn;

	error: LogFn;

	warn: LogFn;

	debug: LogFn;

	trace: LogFn;
}
