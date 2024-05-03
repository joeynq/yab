import type { Context, LoggerAdapter } from "@yab/core";
import Pino, { type Logger, type LoggerOptions } from "pino";

export class PinoLogger implements LoggerAdapter {
	#log: Logger;

	get log(): Logger {
		return this.#log;
	}

	constructor(options?: LoggerOptions) {
		this.#log = Pino({
			base: {},
			formatters: {
				bindings: (obj) => {
					return {
						...obj,
						requestId: obj.requestId || "YAB",
					};
				},
			},
			transport: {
				target: "pino-pretty",
				options: {
					crlf: true,
					colorize: true,
					translateTime: "SYS:HH:MM:ss.l",
					messageFormat: "{{requestId}} {msg}",
					ignore: "requestId,userIp,serverUrl,useAgent",
				},
			},
			...options,
		});
	}

	get level(): string {
		return this.log.level;
	}

	useContext(context: Context) {
		return this.log.child({
			requestId: context.requestId,
			serverUrl: context.serverUrl,
			userIp: context.userIp,
			useAgent: context.useAgent,
		});
	}

	info(obj: object | string, message?: string, ...args: unknown[]): void {
		this.log.info(obj, message, ...args);
	}

	error(obj: object | string, message?: string, ...args: unknown[]): void {
		this.log.error(obj, message, ...args);
	}

	warn(obj: object | string, message?: string, ...args: unknown[]): void {
		this.log.warn(obj, message, ...args);
	}

	debug(obj: object | string, message?: string, ...args: unknown[]): void {
		this.log.debug(obj, message, ...args);
	}

	trace(obj: object | string, message?: string, ...args: unknown[]): void {
		this.log.trace(obj, message, ...args);
	}
}
