import type { LogLevel, LoggerAdapter, LoggerContext } from "@yab/core";
import { clone } from "@yab/utils";
import Pino, { type LogFn, type Logger, type LoggerOptions } from "pino";

export class PinoLogger implements LoggerAdapter<Logger> {
	log: Logger;

	get level() {
		return this.log.level as LogLevel;
	}

	info: LogFn;
	error: LogFn;
	warn: LogFn;
	debug: LogFn;
	trace: LogFn;

	constructor(public options: LoggerOptions = {}) {
		this.log = Pino({
			base: {},
			transport: {
				target: "pino-pretty",
				options: {
					crlf: true,
					colorize: true,
					translateTime: "SYS:HH:MM:ss.l",
					messageFormat: "{{requestId}} {msg}",
					ignore: "requestId,userIp,serverUrl,userAgent",
				},
			},
			...this.options,
		});

		this.info = this.log.info.bind(this.log);
		this.error = this.log.error.bind(this.log);
		this.warn = this.log.warn.bind(this.log);
		this.debug = this.log.debug.bind(this.log);
		this.trace = this.log.trace.bind(this.log);
	}

	setOptions(options: LoggerOptions) {
		this.options = options;
		this.log = Pino({
			base: {},
			transport: {
				target: "pino-pretty",
				options: {
					crlf: true,
					colorize: true,
					translateTime: "SYS:HH:MM:ss.l",
					messageFormat: "{{requestId}} {msg}",
					ignore: "requestId,userIp,serverUrl,userAgent",
				},
			},
			...this.options,
		});

		this.info = this.log.info.bind(this.log);
		this.error = this.log.error.bind(this.log);
		this.warn = this.log.warn.bind(this.log);
		this.debug = this.log.debug.bind(this.log);
		this.trace = this.log.trace.bind(this.log);
	}

	createChild(context: LoggerContext) {
		const child = clone(this, {
			log: this.log.child({
				requestId: context.requestId,
				serverUrl: context.serverUrl,
				userIp: context.userIp,
				userAgent: context.userAgent,
			}),
		});
		child.setOptions(this.options);
		return child;
	}
}
