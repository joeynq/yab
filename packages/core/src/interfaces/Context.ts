import type { EnhancedContainer } from "./Container";

export abstract class Logger {
	abstract info(obj: object, message: string, ...args: unknown[]): void;
	abstract info(message: string, ...args: unknown[]): void;

	abstract error(obj: object, message: string, ...args: unknown[]): void;
	abstract error(message: string, ...args: unknown[]): void;

	abstract warn(obj: object, message: string, ...args: unknown[]): void;
	abstract warn(message: string, ...args: unknown[]): void;

	abstract debug(obj: object, message: string, ...args: unknown[]): void;
	abstract debug(message: string, ...args: unknown[]): void;

	abstract trace(obj: object, message: string, ...args: unknown[]): void;
	abstract trace(message: string, ...args: unknown[]): void;
}

export interface Context {
	request: Request;
	container: EnhancedContainer;
	requestId: string;
	serverUrl: string;
	logger: Logger;
}
