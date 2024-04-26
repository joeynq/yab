import { AsyncLocalStorage } from "node:async_hooks";
import type { Context, Logger } from "@yab/core";

export const LoggerKey = Symbol("Logger");

export interface LoggerServiceOptions<L extends Logger>
	extends Record<string, unknown> {
	logger: L;
	createChild?: (logger: any, ctx: Context) => Logger;
}

export class LoggerService<L extends Logger> {
	#context = new AsyncLocalStorage<Logger>();
	#logger: L;
	#createChild: (ctx: Context) => Logger;

	get logger(): L {
		const stored = this.#context.getStore();
		return new Proxy(this.#logger, {
			get(target, property, receiver) {
				const returned = stored || target;
				return Reflect.get(returned, property, receiver);
			},
		});
	}

	constructor(options: LoggerServiceOptions<L>) {
		this.#logger = options.logger;
		this.#createChild = (ctx: Context) => {
			if (options.createChild) {
				return options.createChild(this.#logger, ctx);
			}
			return this.#logger;
		};
	}

	async useRequestContext(context: Context) {
		const child = this.#createChild(context);
		await new Promise<void>((resolve) => {
			this.#context.run(child, resolve);
		});
		context.logger = child;
	}
}
