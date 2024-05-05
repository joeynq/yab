import type { LoggerAdapter, _RequestContext } from "@yab/core";
import { clone } from "@yab/utils";
import Pino, { type Logger, type LoggerOptions } from "pino";

export class PinoLogger implements LoggerAdapter {
	log: Logger;

	constructor(options?: LoggerOptions) {
		this.log = Pino({
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
					ignore: "requestId,userIp,serverUrl,userAgent",
				},
			},
			...options,
		});
	}

	get level(): string {
		return this.log.level;
	}

	createChild(context: _RequestContext) {
		return clone(this, {
			log: this.log.child({
				requestId: context.requestId,
				serverUrl: context.serverUrl,
				userIp: context.userIp,
				userAgent: context.userAgent,
			}),
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
