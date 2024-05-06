import { clone, format, hasOwn } from "@yab/utils";
import type { LogLevel, LoggerAdapter, LoggerContext } from "../interfaces";

interface ConsoleOptions {
	level: LogLevel;
	formatDate: (date: Date) => string;
}

export class ConsoleLogger implements LoggerAdapter {
	log = console;

	get level() {
		return this.opts?.level || "info";
	}
	context?: LoggerContext;

	opts: ConsoleOptions;

	constructor(opts?: Partial<ConsoleOptions>) {
		this.opts = {
			level: "info",
			formatDate: (date: Date) => date.toLocaleTimeString(),
			...opts,
		};
	}

	createChild(context: LoggerContext) {
		return clone(this, { context });
	}

	info(...args: any): void {
		this.writeLog("info", ...args);
	}

	error(...args: any): void {
		this.writeLog("error", ...args);
	}

	warn(...args: any): void {
		this.writeLog("warn", ...args);
	}

	debug(...args: any): void {
		this.writeLog("debug", ...args);
	}

	trace(...args: any): void {
		this.writeLog("trace", ...args);
	}

	// writeLog, return stack trace if level is error or trace
	protected writeLog(level: LogLevel, ...args: any[]) {
		if (!this.hasLevel(level)) return;

		const log = hasOwn(this.log, level)
			? // @ts-ignore
				this.log[level]
			: this.log.log.bind(this.log);

		let message = "";
		let stack: string | undefined = undefined;
		let obj: any;

		if (args.length === 1) {
			if (typeof args[0] === "string") {
				message = args[0];
			} else {
				obj = args[0];
			}
		} else {
			message = args[0];
			obj = args[1];
		}

		if (obj) {
			message = this.formatMessage(message, obj);
		}

		if (["error", "trace"].includes(level)) {
			stack = this.stackTrace();
		}

		stack ? log(this.logEntry(message), stack) : log(this.logEntry(message));
	}

	protected stackTrace() {
		const stack = new Error().stack;
		if (stack) {
			return stack.split("\n").slice(5).join("\n");
		}
		return "";
	}

	protected formatMessage<O extends object>(message: string, object: O) {
		return format(message, object);
	}

	protected logEntry(message: string) {
		const date = this.opts.formatDate(new Date());
		const level = this.level.toUpperCase();
		if (this.context?.requestId) {
			return `[${date}] ${level} [${this.context.requestId}] ${message}`;
		}
		return `[${date}] ${level} ${message}`;
	}

	protected hasLevel(level: LogLevel) {
		return ["info", "error", "warn", "debug", "trace"].includes(level);
	}
}
