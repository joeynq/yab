import { clone } from "@yab/utils";
import type { LoggerAdapter } from "../interfaces";

export class ConsoleLogger implements LoggerAdapter {
	log = console;
	level: string;

	constructor(level: string) {
		this.level = level;
	}

	createChild() {
		return clone(this, {});
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
