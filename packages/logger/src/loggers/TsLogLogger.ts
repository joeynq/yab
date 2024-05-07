import {
	type LogFn,
	type LogLevel,
	type LogOptions,
	type LoggerAdapter,
	type LoggerContext,
	logLevelOrder,
} from "@yab/core";
import { type Dictionary, clone } from "@yab/utils";
import { type ISettingsParam, Logger } from "tslog";

const levelOf = (level: LogLevel) => logLevelOrder.indexOf(level);
const levelLabel = (level: number) => logLevelOrder[level];

export class TsLogLogger implements LoggerAdapter<Logger<LoggerContext>> {
	log: Logger<LoggerContext>;

	config: LogOptions<ISettingsParam<LoggerContext> & Dictionary>;

	get level() {
		return levelLabel(this.log.settings.minLevel);
	}

	info: LogFn;
	error: LogFn;
	warn: LogFn;
	debug: LogFn;
	trace: LogFn;

	constructor(config: Partial<LogOptions<ISettingsParam<LoggerContext>>>) {
		this.config = Object.assign(
			{
				level: "info",
				stackTrace: true,
				noColor: false,
				options: {},
			},
			config,
		);
		this.log = new Logger({
			...this.config.options,
			minLevel: levelOf(this.config.level),
			stylePrettyLogs: !this.config.noColor,
		});

		this.info = this.log.info.bind(this.log);
		this.error = this.log.error.bind(this.log);
		this.warn = this.log.warn.bind(this.log);
		this.debug = this.log.debug.bind(this.log);
		this.trace = this.log.trace.bind(this.log);
	}

	createChild(context: LoggerContext): LoggerAdapter<Logger<LoggerContext>> {
		const child = this.log.getSubLogger(this.config.options, context);
		return clone(this, {
			log: child,
			config: { ...this.config, options: child.settings },
		});
	}
}
