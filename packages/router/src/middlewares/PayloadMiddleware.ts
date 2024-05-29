import { type RequestContext, asValue } from "@vermi/core";
import { getCookies, parseQuery, searchString } from "@vermi/utils";
import { Middleware, RouteInit, Use } from "../decorators";

@Middleware()
class PayloadMiddleware {
	@RouteInit()
	async parsePayloadFromRequest(context: RequestContext) {
		const request = context.store.request;
		context.register(
			"payload",
			asValue({
				query: parseQuery(searchString(request.url)) || undefined,
				body: await request.text(),
				headers: Object.fromEntries(request.headers),
				cookies: getCookies(request.headers.get("cookie") || ""),
			}),
		);
	}
}

export const Payload = () => Use(PayloadMiddleware);
