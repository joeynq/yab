import { AsyncLocalStorage } from "node:async_hooks";
import type { Context } from "@yab/core";
import { type Logger, type LoggerOptions, pino } from "pino";

export const LoggerKey = Symbol("Logger");
export type { Logger } from "pino";

const context = new AsyncLocalStorage<Map<string, any>>();

let logger: Logger;

export const createLogger = (options?: LoggerOptions) => {
	logger = pino({
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
	return logger;
};

export const getLogger = () => {
	return new Proxy(logger, {
		get(target, property, receiver) {
			const returned: Logger = context.getStore()?.get("logger") || target;
			return Reflect.get(returned, property, receiver);
		},
	});
};

export const useContext = async (ctx: Context) => {
	const child = logger.child({ requestId: ctx.requestId });
	const store = new Map();
	store.set("logger", child);

	await new Promise<void>((resolve) => {
		context.run(store, resolve);
	});
	ctx.logger = child;
};
