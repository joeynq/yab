import type {
	LogLevel,
	LogOptions,
	LoggerAdapter,
	LoggerContext,
} from "@yab/core";
import type { Dictionary } from "@yab/utils";
import Pino, { type Logger, type LoggerOptions } from "pino";
import pinoCaller from "pino-caller";

export class PinoLogger implements LoggerAdapter<Logger> {
	log!: Logger;
	options: LogOptions<LoggerOptions & Dictionary>;

	get level() {
		return this.log.level as LogLevel;
	}

	constructor(options: Partial<LogOptions<LoggerOptions & Dictionary>> = {}) {
		this.options = Object.assign(
			{
				level: "info",
				stackTrace: true,
				noColor: false,
				options: {},
			},
			options,
		);
		this.setLogger(
			Pino({
				base: {},
				transport: {
					target: "pino-pretty",
					options: {
						crlf: true,
						colorize: !this.options.noColor,
						translateTime: "SYS:HH:MM:ss.l",
						messageFormat: "{{requestId}} {msg}",
						ignore: "requestId,userIp,serverUrl,userAgent",
					},
				},
			}),
		);
	}

	setLogger(logger: Logger) {
		this.log = pinoCaller(logger, { stackAdjustment: 1 });
	}

	createChild(context: LoggerContext) {
		const child = new PinoLogger(this.options);
		child.setLogger(this.log.child(context));
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
