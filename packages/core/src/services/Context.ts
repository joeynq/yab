import { AsyncLocalStorage } from "node:async_hooks";
import { type Dictionary, ensure } from "@yab/utils";
import type { SocketAddress } from "bun";
import type { Yab } from "../Yab";
import type { EnhancedContainer, LoggerAdapter } from "../interfaces";

const store = new AsyncLocalStorage<EnhancedContainer<_AppContext>>();

export interface _AppContext {
	env: Dictionary<unknown>;
	app: Yab;
	logger: LoggerAdapter;
	_logger: LoggerAdapter;
	requestId?: string;
	request?: Request;
	serverUrl?: string;
	userIp?: SocketAddress;
	userAgent?: string;
	[key: string]: unknown;
}

export interface _RequestContext extends _AppContext {
	request: Request;
	requestId: string;
	serverUrl: string;
}

export type AppContext = EnhancedContainer<_AppContext>;

export type RequestContext = EnhancedContainer<_RequestContext>;

export interface ContextStore extends EnhancedContainer<_AppContext> {
	[key: string]: unknown;
}

export const getContextRef = () => {
	function get<T>(): EnhancedContainer<_AppContext>;
	function get<T>(key: keyof _AppContext): T | undefined;
	function get<T>(key?: keyof _AppContext) {
		const context = store.getStore();
		ensure(context, "No context found");

		if (!key) {
			return context;
		}

		return context.resolveValue<T>(key as string);
	}
	return { get };
};

export class ContextService {
	get context() {
		return store.getStore();
	}

	setContext(context: EnhancedContainer<any>) {
		store.enterWith(context);
	}

	clearContext(cb: () => void) {
		store.exit(cb);
	}

	async runInContext<Context extends _AppContext, T>(
		context: EnhancedContainer<_AppContext>,
		cb: (stored: EnhancedContainer<Context>) => T | Promise<T>,
		exitCb = () => {},
	): Promise<T> {
		this.setContext(context);
		const result = await cb(store.getStore() as EnhancedContainer<Context>);
		this.clearContext(() => {
			context.dispose();
			exitCb();
		});
		return result;
	}
}
