import type { Logger as BaseLogger, Context } from "@yab/core";
import { type Logger, type LoggerOptions, pino } from "pino";

export const createLogger = (options?: LoggerOptions): BaseLogger => {
	return pino({
		base: {},
		transport: {
			target: "pino-pretty",
			options: {
				crlf: true,
				colorize: true,
				translateTime: "SYS:HH:MM:ss.l",
				messageFormat: "{requestId}\n\t{msg}\n\n",
				ignore: "requestId",
			},
		},
		...options,
	});
};

export const createChild = (logger: Logger, ctx: Context): BaseLogger => {
	return logger.child({ requestId: ctx.requestId });
};

export { type Logger as PinoLogger } from "pino";
