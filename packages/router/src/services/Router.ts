import {
	type ContextService,
	Injectable,
	type RequestContext,
	asValue,
} from "@vermi/core";
import { FindMyWay } from "@vermi/find-my-way";
import { ensure, getCookies } from "@vermi/utils";
import { RouterEvent } from "../event";
import type { HTTPMethod, RouteMatch } from "../interfaces";
import { getRequestScope } from "../utils";

type ConsoleTable = {
	method: string;
	path: string;
	handler: string;
};

@Injectable("SINGLETON")
export class Router {
	#debug: ConsoleTable[] = [];

	protected router = new FindMyWay<RouteMatch>();

	get context() {
		ensure(this.contextService.context);
		return this.contextService.context.expose() as RequestContext;
	}

	get debug() {
		return this.#debug;
	}

	constructor(private contextService: ContextService) {}

	async match() {
		const request = this.context.resolve<Request>("request");
		const match = this.router.lookup(request);

		if (!match) {
			return;
		}

		const contentType = request.headers.get("content-type");

		let body: any = undefined;
		switch (contentType) {
			case "application/json": {
				const text = await request.text();
				body = text ? JSON.parse(text) : undefined;
				break;
			}
			case "application/x-www-form-urlencoded":
				body = await request.formData();
				break;
			default:
				body = await request.text();
				break;
		}

		this.context.register({
			route: asValue(match.store),
			payload: asValue({
				body,
				query: match.searchParams,
				params: match.params,
				headers: Object.fromEntries(request.headers),
				cookies: getCookies(request.headers.get("cookie") || ""),
			}),
		});

		return match;
	}

	addRoute(method: HTTPMethod, path: string, store: RouteMatch) {
		this.#debug.push({
			method,
			path: path,
			handler: store.handler.name,
		});
		this.router.add(method, path, store);
		return store;
	}

	async handleRequest() {
		const context = this.context;
		const { request, hooks, route } = context.store;

		const relativePath = route.path.replace(/\/$/, "");
		const requestScope = getRequestScope(
			request.method.toUpperCase() as HTTPMethod,
			relativePath,
		);

		const invoke = async (event: RouterEvent, ...data: any[]) => {
			return hooks.invoke(event, data, {
				when: (scope: string) => requestScope === scope,
				breakOn: (result: any) => result instanceof Response,
			});
		};

		let response: any = undefined;

		// on route guard
		response = await invoke(RouterEvent.Guard, context);
		if (response) {
			return response;
		}

		// before route handle
		response = await invoke(RouterEvent.BeforeHandle, context);
		if (response) {
			return response;
		}

		const result = context.store.route.handler(context);

		response = await invoke(RouterEvent.AfterHandle, context, result);

		return response || result;
	}
}
