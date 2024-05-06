import type { _RequestContext } from "./Container";

export interface LoggerAdapter<Logger = any> {
	log: Logger;
	level: string;

	createChild(
		context: Pick<
			_RequestContext,
			"requestId" | "serverUrl" | "userIp" | "userAgent"
		>,
	): LoggerAdapter<Logger>;

	info(obj: object, message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;

	error(obj: object, message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;

	warn(obj: object, message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;

	debug(obj: object, message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;

	trace(obj: object, message: string, ...args: unknown[]): void;
	trace(message: string, ...args: unknown[]): void;
}
