import { AuthModule } from "@vermi/auth";
import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	type VermiModule,
} from "@vermi/core";
import {
	InternalServerError,
	Res,
	RouterModule,
	type RouterModuleConfig,
	type SlashedPath,
} from "@vermi/router";
import { pathIs, pathStartsWith } from "@vermi/utils";
import type { Server } from "bun";
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
import type { LimitSettings } from "./settings/values";

type AuthConfig = Record<
	string,
	{ scheme: Record<string, SecuritySchemeObject> }
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

@Module({ deps: [OpenAPIService, RouterModule, AuthModule] })
export class OpenAPIModule implements VermiModule<OpenAPIConfig> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: OpenAPIConfig;
	@Config("AuthModule") public authConfig?: AuthConfig;
	@Config("RouterModule") public routerConfig?: RouterModuleConfig;

	baseUrl = "";

	constructor(protected openApiService: OpenAPIService) {}

	@AppHook("app:started")
	async started(_: AppContext, server: Server) {
		this.baseUrl = server.url.toString().replace(/\/$/, "");

		const docsUrl =
			this.baseUrl + (this.config.path || "/openapi") + this.config.prefix;

		this.logger.info("OpenAPI Module initialized on %s", docsUrl);
		this.logger.info(
			"OpenAPI Specs: %s",
			`${docsUrl}/${this.config.fileName || "openapi.json"}`,
		);
	}

	@AppHook("app:init")
	async init() {
		const authConfig = this.authConfig;
		if (authConfig) {
			const schemes = Object.values(authConfig).reduce(
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				(acc, { scheme }) => ({ ...acc, ...scheme }),
				{} as Record<string, SecuritySchemeObject>,
			);
			this.openApiService.addSecuritySchemes(schemes);
		}
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

		const routerConfig = this.routerConfig?.[prefix];

		const casing = routerConfig?.options?.casing?.interfaces;

		if (pathIs(url, fileUrl)) {
			try {
				const specs = await this.openApiService.buildSpecs({
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
