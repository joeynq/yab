import type { SocketAddress } from "bun";

export interface LoggerAdapter<Logger = any> {
	log: Logger;
	level: string;

	useContext(context: Context): Logger;

	info(obj: object, message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;

	error(obj: object, message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;

	warn(obj: object, message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;

	debug(obj: object, message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;

	trace(obj: object, message: string, ...args: unknown[]): void;
	trace(message: string, ...args: unknown[]): void;
}

export interface Context {
	request: Request;
	requestId: string;
	serverUrl: string;
	logger: LoggerAdapter;
	userIp?: SocketAddress;
	userAgent?: string;
}
