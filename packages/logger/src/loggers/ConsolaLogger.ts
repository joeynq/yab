import type { LogOptions, LoggerAdapter, LoggerContext } from "@yab/core";
import type { Dictionary } from "@yab/utils";
import {
	type Consola,
	type ConsolaInstance,
	type ConsolaOptions,
	LogLevels,
	createConsola,
} from "consola";

export class ConsolaLogger implements LoggerAdapter<Consola> {
	log: ConsolaInstance;

	config: LogOptions<ConsolaOptions & Dictionary>;

	get level() {
		return this.config.level;
	}
	constructor(config: Partial<LogOptions<ConsolaOptions & Dictionary>> = {}) {
		this.config = Object.assign(
			{
				level: "info",
				stackTrace: true,
				noColor: false,
				options: {},
			},
			config,
		);
		this.log = createConsola({
			...this.config.options,
			level: LogLevels[this.config.level],
		});
		this.log.wrapConsole();
	}

	setLogger(logger: ConsolaInstance) {
		this.log = logger;
	}

	createChild(context: LoggerContext): LoggerAdapter<Consola> {
		const child = new ConsolaLogger(this.config);
		child.setLogger(this.log.withTag(context.requestId));
		child.log.wrapConsole();
		return child;
	}

	info(arg: any, ...args: any[]) {
		this.log.info(arg, ...args);
	}

	error(arg: any, ...args: any[]) {
		this.log.error(arg, ...args);
	}

	warn(arg: any, ...args: any[]) {
		this.log.warn(arg, ...args);
	}

	debug(arg: any, ...args: any[]) {
		this.log.debug(arg, ...args);
	}

	trace(arg: any, ...args: any[]) {
		this.log.trace(arg, ...args);
	}
}
