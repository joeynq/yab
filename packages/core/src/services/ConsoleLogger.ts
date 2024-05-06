import { clone, format, hasOwn, omitUndefined } from "@yab/utils";
import { Chalk, type ChalkInstance } from "chalk";
import { logLevelOrder } from "../enum/logLevel";
import type { LogLevel, LoggerAdapter, LoggerContext } from "../interfaces";

Error.stackTraceLimit = 10;

let chalk = new Chalk();

Error.prepareStackTrace = (error, stack) => {
	const stackTrace = stack
		.map((callSite) => {
			const functionName = callSite.getFunctionName();
			const fileName = callSite.getFileName();
			const lineNumber = callSite.getLineNumber();
			const columnNumber = callSite.getColumnNumber();

			const functionNameColor = functionName
				? functionName
				: chalk.dim("<anonymous>");

			const fileNameOnly = fileName?.split("/").pop();
			const pathWithoutFileName = fileName?.split("/").slice(0, -1).join("/");
			const fileNameColor = fileName
				? `${pathWithoutFileName}/${chalk.cyan(fileNameOnly)}`
				: "unknown";

			const lineNumberColor = lineNumber
				? chalk.yellow(`:${lineNumber}`)
				: chalk.red(":0");

			const columnNumberColor = columnNumber
				? chalk.yellow(`:${columnNumber}`)
				: "";

			return `    at ${functionNameColor} ${chalk.gray(
				`(${fileNameColor}${lineNumberColor}${columnNumberColor})`,
			)}`;
		})
		.join("\n");

	return `${chalk.red(error)}\n${stackTrace}`;
};

interface ConsoleOptions {
	level: LogLevel;
	formatDate: (date: Date) => string;
	noColor?: boolean;
	stackTrace?: boolean;
}

export class ConsoleLogger implements LoggerAdapter {
	log = console;

	get chalk(): ChalkInstance {
		return chalk;
	}

	get level() {
		return this.opts.level;
	}
	context?: LoggerContext;

	opts: ConsoleOptions;

	constructor(opts?: Partial<ConsoleOptions>) {
		this.opts = Object.assign(
			{
				level: "info",
				formatDate: (date: Date) =>
					date.toISOString().slice(0, 23).replace("T", " "),
				stackTrace: true,
				noColor: false,
			},
			opts ? omitUndefined(opts) : {},
		);

		chalk = new Chalk({ level: !opts?.noColor ? 1 : 0 });
	}

	createChild(context: LoggerContext) {
		return clone(this, { context, opts: this.opts });
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

		if (obj instanceof Error && obj.stack) {
			stack = obj.stack;
			errorLevel = "error";
		} else if (obj) {
			message = this.formatMessage(message, obj);
		}

		stack && this.opts.stackTrace
			? log(this.logEntry(errorLevel || level, `${message}`), `\n${stack}`)
			: log(this.logEntry(errorLevel || level, message));
	}

	protected formatMessage<O extends object>(message: string, object: O) {
		return format(message, object);
	}

	protected logEntry(level: LogLevel, message: string) {
		const date = this.opts.formatDate(new Date());
		const coloredLevel =
			level === "error" || level === "fatal"
				? this.chalk.red(level.padEnd(5, " ").toLocaleUpperCase())
				: level === "warn" || level === "debug"
					? this.chalk.yellow(level.padEnd(5, " ").toLocaleUpperCase())
					: this.chalk.green(level.padEnd(5, " ").toLocaleUpperCase());

		const coloredMessage =
			level === "error" || level === "fatal"
				? this.chalk.red(message)
				: message;

		if (this.context?.requestId) {
			const requestId = this.chalk.whiteBright(`${this.context.requestId}`);

			return this.chalk.cyan(
				`[${date}] ${coloredLevel} ${requestId} ${coloredMessage}`,
			);
		}
		return this.chalk.cyan(`[${date}] ${coloredLevel} ${coloredMessage}`);
	}

	protected allowLevel(level: LogLevel) {
		if (this.level === "silent") return false;

		const allowed = logLevelOrder.indexOf(this.level);
		const current = logLevelOrder.indexOf(level);

		return current >= allowed;
	}
}
