import type { Dictionary } from "@yab/utils";
import type { SocketAddress } from "bun";
import type { EnhancedContainer } from "./Container";

export interface Logger extends Dictionary<any> {
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
	container: EnhancedContainer;
	requestId: string;
	serverUrl: string;
	logger: Logger;
	userIp?: SocketAddress;
	useAgent?: string;
}
