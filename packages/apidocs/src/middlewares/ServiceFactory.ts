import { Config, type RequestContext, asValue } from "@vermi/core";
import { Matched, Middleware, NotFound } from "@vermi/router";
import type { ApiDocsConfig } from "../ApiDocsModule";
import { AsyncAPIService, OpenAPIService } from "../services";
import { isOpenAPI } from "../utils/isOpenAPI";

@Middleware()
export class ServiceFactoryMiddleware {
	@Config("ApiDocsModule") private config!: ApiDocsConfig;

	@Matched()
	async beforeRoute(ctx: RequestContext) {
		console.log(ctx.store.route.mount);
		const id = ctx.store.route.mount ?? "/";
		if (!Object.keys(this.config).includes(id)) {
			throw new NotFound(`No API Docs config found for ${id}`);
		}
		const config = this.config[id as keyof ApiDocsConfig];

		if (isOpenAPI(config)) {
			ctx.register("apiService", asValue(new OpenAPIService(config)));
			return;
		}
		ctx.register("apiService", asValue(new AsyncAPIService(config)));
		return;
	}
}
