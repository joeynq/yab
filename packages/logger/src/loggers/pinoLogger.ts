import type { Logger as BaseLogger, Context } from "@yab/core";
import { type Logger, type LoggerOptions, pino } from "pino";

export const createLogger = (options?: LoggerOptions): BaseLogger => {
	return pino({
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
				ignore: "requestId,userIp",
			},
		},
		...options,
	});
};

export const createChild = (logger: Logger, ctx: Context): BaseLogger => {
	return logger.child({
		requestId: ctx.requestId,
		userIp: ctx.userIp?.address,
	});
};

export { type Logger as PinoLogger } from "pino";
