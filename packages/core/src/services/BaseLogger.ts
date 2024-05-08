import { clone, format } from "@yab/utils";
import type {
	AbstractLogger,
	LogLevel,
	LoggerAdapter,
	LoggerContext,
} from "../interfaces";

export abstract class BaseLogger<Logger extends AbstractLogger>
	implements LoggerAdapter
{
	log!: Logger;
	abstract level: LogLevel;

	context?: LoggerContext;

	protected abstract createChild(context: any): Logger;

	setLogger(logger: Logger) {
		this.log = logger;
	}

	useContext(context: LoggerContext) {
		const child = this.createChild(context);
		const newInstance = clone(this, {});
		newInstance.setLogger(child);
		newInstance.context = context;

		return newInstance;
	}

	info(arg: any, ...args: any[]) {
		this.log.info(...this.#formatMessage(arg, ...args));
	}

	error(arg: any, ...args: any[]) {
		this.log.error(...this.#formatMessage(arg, ...args));
	}

	warn(arg: any, ...args: any[]) {
		this.log.warn(...this.#formatMessage(arg, ...args));
	}

	debug(arg: any, ...args: any[]) {
		this.log.debug(arg, ...args);
	}

	trace(arg: any, ...args: any[]) {
		this.log.trace(...this.#formatMessage(arg, ...args));
	}

	#formatMessage(arg: any, ...args: any[]): any[] {
		// if first arg is string, then it's a message, second arg is interpolation context
		if (
			typeof arg === "string" &&
			args.length > 0 &&
			typeof args[0] === "object"
		) {
			const message = format(arg, args[0]);
			return [message, ...args.slice(1)];
		}
		// if first arg is object, then it's a log object, last rule applies to second arg
		if (
			typeof arg === "object" &&
			args.length > 0 &&
			typeof args[0] === "string"
		) {
			const [message, ...rest] = this.#formatMessage(args[0], ...args.slice(1));
			return [arg, message, ...rest];
		}

		return [arg, ...args];
	}
}
