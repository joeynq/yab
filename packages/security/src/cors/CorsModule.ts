import { AppHook, Module, type RequestContext, VermiModule } from "@vermi/core";

export type CorsConfig = {
	origin?: string[];
	methods?: string[];
	allowedHeaders?: string[];
	exposedHeaders?: string[];
	credentials?: boolean;
	maxAge?: number;
	preflightContinue?: boolean;
	optionsSuccessStatus?: number;
};

@Module()
export class CorsModule extends VermiModule<CorsConfig> {
	constructor(public config: CorsConfig) {
		super();
	}

	@AppHook("app:response")
	async corsHook(_: RequestContext, response: Response) {
		if (this.config.origin) {
			response.headers.set(
				"Access-Control-Allow-Origin",
				this.config.origin.join(", "),
			);
		}

		if (this.config.methods) {
			response.headers.set(
				"Access-Control-Allow-Methods",
				this.config.methods.join(", "),
			);
		}

		if (this.config.allowedHeaders) {
			response.headers.set(
				"Access-Control-Allow-Headers",
				this.config.allowedHeaders.join(", "),
			);
		}

		if (this.config.exposedHeaders) {
			response.headers.set(
				"Access-Control-Expose-Headers",
				this.config.exposedHeaders.join(", "),
			);
		}

		if (this.config.credentials) {
			response.headers.set("Access-Control-Allow-Credentials", "true");
		}

		if (this.config.maxAge) {
			response.headers.set(
				"Access-Control-Max-Age",
				this.config.maxAge.toString(),
			);
		}

		if (this.config.preflightContinue) {
			response.headers.set("Access-Control-Continue", "true");
		}

		if (this.config.optionsSuccessStatus) {
			response.headers.set(
				"Access-Control-Options-Success",
				this.config.optionsSuccessStatus.toString(),
			);
		}

		return response;
	}
}
