import { AsyncLocalStorage } from "node:async_hooks";
import type { EnhancedContainer } from "@vermi/core";
import type { _WsContext } from "../interfaces/WsContext";

const store = new AsyncLocalStorage<EnhancedContainer<_WsContext>>();

export const containerRef = <
	T extends object = _WsContext,
>(): EnhancedContainer<T> => {
	return store.getStore() as EnhancedContainer<T>;
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

	async runInContext<Context extends _WsContext, T>(
		context: EnhancedContainer<_WsContext>,
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
