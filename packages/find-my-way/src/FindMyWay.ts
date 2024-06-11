import { parseQuery, pathname } from "@vermi/utils";
import Router, { type FindResult, type HTTPMethod } from "find-my-way";

export type { HTTPMethod };

export interface Matched<T> extends FindResult<Router.HTTPVersion.V2> {
	store: T;
}

export class FindMyWay<Data> {
	#router = Router<Router.HTTPVersion.V2>({
		ignoreDuplicateSlashes: true,
		ignoreTrailingSlash: true,
		// @ts-ignore
		querystringParser: (str: string) => parseQuery(str),
	});

	add(method: HTTPMethod, path: string, data: Data) {
		this.#router.on(method as HTTPMethod, path, () => {}, data);
	}

	find(method: string, path: string): Matched<Data> | null {
		return this.#router.find(method as HTTPMethod, path);
	}

	lookup(request: Request) {
		const method = request.method.toUpperCase();
		return this.find(method, pathname(request.url));
	}
}
