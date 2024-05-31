import { Config, type RequestContext, asValue } from "@vermi/core";
import { stringify } from "@vermi/utils";
import type { RouterModuleConfig } from "../RouterModule";
import { AfterRoute, BeforeRoute, Middleware, Use } from "../decorators";
import { type CasingType, casingFactory } from "../services";
import { getConfigFromRequest } from "../utils/getConfigFromRequest";

const getCasing = (context: RequestContext, config: RouterModuleConfig) => {
	const cfg = getConfigFromRequest(config, context.store.request);
	const internal = cfg?.options?.casing?.internal ?? "camel";
	const interfaces = cfg?.options?.casing?.interfaces;

	return { internal, interfaces };
};

@Middleware()
class CasingMiddleware {
	@Config("RouterModule") config!: RouterModuleConfig;

	shouldProcess(
		internal: CasingType,
		interfaces?: CasingType,
	): interfaces is CasingType {
		return !!interfaces && interfaces !== internal;
	}

	@BeforeRoute()
	async payloadCasing(context: RequestContext) {
		const { internal, interfaces } = getCasing(context, this.config);

		if (!this.shouldProcess(internal, interfaces)) {
			return;
		}

		const service = casingFactory(internal);
		const { query, body, headers, cookies } = context.store.payload;

		context.register(
			"payload",
			asValue({
				query: query ? service.convert(query) : undefined,
				body: body ? service.convert(JSON.parse(body)) : undefined,
				headers: service.convert(headers),
				cookies: service.convert(cookies),
			}),
		);
	}

	@AfterRoute()
	async responseCasing(context: RequestContext, response: Response) {
		const { internal, interfaces } = getCasing(context, this.config);

		if (!this.shouldProcess(internal, interfaces)) {
			return response;
		}

		const service = casingFactory(interfaces);

		const body = await response.json();

		return new Response(stringify(service.convert(body as object)), {
			status: response.status,
			headers: response.headers,
		});
	}
}

export const Casing = () => Use(CasingMiddleware);
