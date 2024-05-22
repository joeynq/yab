import {
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
} from "@vermi/core";
import {
	InternalServerError,
	Res,
	type RouterModuleConfig,
	type SlashedPath,
} from "@vermi/router";
import { deepMerge, pathIs, pathStartsWith } from "@vermi/utils";
import {
	type OpenAPIObject,
	type SecuritySchemeObject,
} from "openapi3-ts/oas31";
import { renderToString } from "react-dom/server";
import { ScalarPage } from "./components";
import {
	type OpenAPIFeatures,
	OpenAPIService,
} from "./services/OpenAPIService";
import { setDefaultLimit } from "./settings/setDefaultLimit";
import type { LimitSettings } from "./settings/values";

type AuthConfig = Record<
	string,
	{
		scheme: Record<string, SecuritySchemeObject>;
	}
>;

export interface OpenAPIConfig {
	prefix: SlashedPath;
	path?: string;
	fileName?: string;
	specs?: Partial<OpenAPIObject>;
	override?: boolean;
	title?: string;
	features?: OpenAPIFeatures;
	limits?: Partial<LimitSettings>;
}
const defaultSpecs: OpenAPIObject = {
	openapi: "3.1.0",
	info: {
		title: "Vermi API",
		version: "1.0.0",
	},
	components: {},
	paths: {},
};

@Module()
export class OpenAPIModule extends VermiModule<OpenAPIConfig> {
	#service: OpenAPIService;

	constructor(
		protected configuration: Configuration,
		protected logger: LoggerAdapter,
	) {
		super();

		let specs: OpenAPIObject;
		if (this.config.override) {
			specs = (this.config.specs as OpenAPIObject) || defaultSpecs;
		} else {
			specs = deepMerge(defaultSpecs, this.config.specs || {}) as OpenAPIObject;
		}

		this.config.limits && setDefaultLimit(this.config.limits);

		this.#service = new OpenAPIService(specs, this.config.features);
	}

	@AppHook("app:init")
	async init() {
		const authConfig = this.configuration.getModuleConfig("AuthModule")
			?.config as AuthConfig | undefined;

		if (authConfig) {
			const schemes = Object.values(authConfig).reduce(
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				(acc, { scheme }) => ({ ...acc, ...scheme }),
				{} as Record<string, SecuritySchemeObject>,
			);
			this.#service.addSecuritySchemes(schemes);
		}

		this.logger.info("OpenAPI Module initialized on {path}", {
			path: this.config.path || "/openapi",
		});
		this.logger.info("OpenAPI Specs: {fileName}", {
			fileName: this.config.fileName || "openapi.json",
		});
	}

	@AppHook("app:request")
	async request(context: RequestContext) {
		const {
			prefix,
			path = "/openapi",
			fileName = "openapi.json",
			title = "Vermi API",
		} = this.config;

		const fileUrl = `${path}${prefix}/${fileName}`;

		const url = context.store.request.url;

		const routerConfig =
			this.configuration.getModuleConfig<RouterModuleConfig>("RouterModule")
				?.config[prefix];

		const casing = routerConfig?.options?.casing?.interfaces;

		if (pathIs(url, fileUrl)) {
			try {
				const specs = await this.#service.buildSpecs({
					serverUrl: context.store.serverUrl,
					title: this.config.title || "Vermi API",
					casing,
				});
				return Res.ok(specs);
			} catch (err) {
				this.logger.error(err, "Error building OpenAPI specs");
				return new InternalServerError(
					"Error building OpenAPI specs",
					err as Error,
				).toResponse();
			}
		}

		if (pathStartsWith(url, `${path}${prefix}`)) {
			try {
				const page = renderToString(<ScalarPage url={fileUrl} title={title} />);
				return Res.html(`<!doctype html>${page}`);
			} catch (err) {
				this.logger.error(err, "Error rendering OpenAPI page");
				return new InternalServerError(
					"Error rendering OpenAPI page",
					err as Error,
				).toResponse();
			}
		}
	}
}
