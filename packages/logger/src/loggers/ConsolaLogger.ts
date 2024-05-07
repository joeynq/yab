import type {
	LogFn,
	LogOptions,
	LoggerAdapter,
	LoggerContext,
} from "@yab/core";
import { type Dictionary, clone } from "@yab/utils";
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

	info: LogFn;
	error: LogFn;
	warn: LogFn;
	debug: LogFn;
	trace: LogFn;

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

		this.info = this.log.info.bind(this.log);
		this.error = this.log.error.bind(this.log);
		this.warn = this.log.warn.bind(this.log);
		this.debug = this.log.debug.bind(this.log);
		this.trace = this.log.trace.bind(this.log);
	}

	createChild(context: LoggerContext): LoggerAdapter<Consola> {
		return clone(this, {
			context,
			config: this.config,
			log: this.log.create({}).withTag(context.requestId).wrapConsole(),
		});
	}
}
