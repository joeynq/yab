import { AsyncLocalStorage } from "node:async_hooks";
import type { Context } from "../interfaces";

const store = new AsyncLocalStorage<Context>();

export const getContextRef = () => {
	return {
		get: (key?: keyof Context) => {
			const context = store.getStore();
			if (key) {
				return context?.[key];
			}
			return context;
		},
	};
};

export type ContextStore = ReturnType<typeof getContextRef>;

export class ContextService {
	get context() {
		return store.getStore();
	}

	setContext(context: Context) {
		store.enterWith(context);
	}

	clearContext(cb: () => void) {
		store.exit(cb);
	}

	runWithContext<T>(context: Context, cb: () => T, exitCb = () => {}): T {
		this.setContext(context);
		const result = cb();
		this.clearContext(exitCb);
		return result;
	}
}
