import { AsyncLocalStorage } from "node:async_hooks";
import type { EnhancedContainer, _AppContext } from "../interfaces";

const store = new AsyncLocalStorage<EnhancedContainer<_AppContext>>();

export const containerRef = <
	T extends object = _AppContext,
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
