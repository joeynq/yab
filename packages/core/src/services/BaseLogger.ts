import { clone } from "@yab/utils";
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
