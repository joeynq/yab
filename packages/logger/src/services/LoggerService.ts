import type { Context, Logger } from "@yab/core";

export interface LoggerServiceOptions<L extends Logger>
	extends Record<string, unknown> {
	logger: L;
	createChild?: (logger: any, ctx: Context) => Logger;
}

export class LoggerService<L extends Logger> {
	#logger: L;
	#createChild: (ctx: Context) => Logger;

	get logger(): L {
		return this.#logger;
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
		context.logger = child;
	}
}
