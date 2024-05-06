import { clone, format, hasOwn } from "@yab/utils";
import chalk, { Chalk, type ChalkInstance } from "chalk";
import { logLevelOrder } from "../enum/logLevel";
import type { LogLevel, LoggerAdapter, LoggerContext } from "../interfaces";

interface ConsoleOptions {
	level: LogLevel;
	formatDate: (date: Date) => string;
	noColor?: boolean;
}

export class ConsoleLogger implements LoggerAdapter {
	log = console;
	chalk: ChalkInstance;

	get level() {
		return this.opts.level;
	}
	context?: LoggerContext;

	opts: ConsoleOptions;

	constructor(opts?: Partial<ConsoleOptions>) {
		this.opts = {
			level: "info",
			formatDate: (date: Date) =>
				date.toISOString().slice(0, 23).replace("T", " "),
			...opts,
		};

		this.chalk = new Chalk({ level: !opts?.noColor ? 1 : 0 });
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
		if (!this.allowLevel(level)) return;

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
				message = JSON.stringify(args[0]);
			}
		} else {
			message = args[1];
			obj = args[0];
		}

		let errorLevel: LogLevel | undefined = undefined;

		if (obj instanceof Error) {
			message = obj.message;
			stack = obj.stack;
			errorLevel = "error";
		} else if (obj) {
			message = this.formatMessage(message, obj);
		}

		if (["error", "trace"].includes(level)) {
			stack = obj;
		}

		stack
			? log(this.logEntry(errorLevel || level, message), "\n", stack)
			: log(this.logEntry(errorLevel || level, message));
	}

	protected formatMessage<O extends object>(message: string, object: O) {
		return format(message, object);
	}

	protected logEntry(level: LogLevel, message: string) {
		const date = this.opts.formatDate(new Date());
		const coloredLevel =
			level === "error" || level === "fatal"
				? chalk.red(level.padEnd(5, " ").toLocaleUpperCase())
				: level === "warn" || level === "debug"
					? chalk.yellow(level.padEnd(5, " ").toLocaleUpperCase())
					: chalk.green(level.padEnd(5, " ").toLocaleUpperCase());

		const coloredMessage =
			level === "error" || level === "fatal" ? chalk.red(message) : message;

		if (this.context?.requestId) {
			const requestId = chalk.whiteBright(`${this.context.requestId}`);

			return chalk.cyan(
				`[${date}] ${coloredLevel} ${requestId} ${coloredMessage}`,
			);
		}
		return chalk.cyan(`[${date}] ${coloredLevel} ${coloredMessage}`);
	}

	protected allowLevel(level: LogLevel) {
		if (this.level === "silent") return false;

		const allowed = logLevelOrder.indexOf(this.level);
		const current = logLevelOrder.indexOf(level);

		return current >= allowed;
	}
}
