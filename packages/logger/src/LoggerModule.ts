import {
	type Context,
	Module,
	YabHook,
	type YabOptions,
	container,
} from "@yab/core";
import { asValue } from "awilix";
import type { LoggerOptions } from "pino";
import {
	LoggerKey,
	createLogger,
	getLogger,
	useContext,
} from "./services/logger";

export class LoggerModule extends Module<{ pino: LoggerOptions }> {
	constructor(public config: { pino: LoggerOptions }) {
		super();
		this.#initLogger(config.pino);
	}

	#initLogger(pinoOptions?: YabOptions["logger"]) {
		createLogger(pinoOptions);
		const logger = getLogger();
		container.register({
			[LoggerKey.toString()]: asValue(logger),
		});
	}

	@YabHook("app:request")
	async applyContext(ctx: Context) {
		await useContext(ctx);
		ctx.logger = getLogger();
	}
}
