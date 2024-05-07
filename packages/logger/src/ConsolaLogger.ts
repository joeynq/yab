import { BaseLogger, type LogOptions, type LoggerContext } from "@yab/core";
import type { Dictionary } from "@yab/utils";
import {
	type ConsolaInstance,
	type ConsolaOptions,
	LogLevels,
	createConsola,
} from "consola";

export class ConsolaLogger extends BaseLogger<ConsolaInstance> {
	config: LogOptions<ConsolaOptions & Dictionary>;

	get level() {
		return this.config.level;
	}

	constructor(config: Partial<LogOptions<ConsolaOptions & Dictionary>> = {}) {
		super();
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

	createChild(context: LoggerContext) {
		const child = this.log.withTag(context.requestId);
		child.wrapConsole();
		return child;
	}
}
