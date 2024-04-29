import { Injectable } from "../decorators";
import type { LoggerAdapter } from "../interfaces";

@Injectable()
export class ConsoleLogger implements LoggerAdapter {
	log = console;
	level: string;

	constructor(level: string) {
		this.level = level;
	}

	useContext() {
		return this.log;
	}

	info(obj: unknown, message?: unknown, ...args: unknown[]): void {
		this.log.info(obj, message, ...args);
	}

	error(obj: unknown, message?: unknown, ...args: unknown[]): void {
		this.log.error(obj, message, ...args);
	}

	warn(obj: unknown, message?: unknown, ...args: unknown[]): void {
		this.log.warn(obj, message, ...args);
	}

	debug(obj: unknown, message?: unknown, ...args: unknown[]): void {
		this.log.debug(obj, message, ...args);
	}

	trace(obj: unknown, message?: unknown, ...args: unknown[]): void {
		this.log.trace(obj, message, ...args);
	}
}
