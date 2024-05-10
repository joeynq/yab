import { Module, type RequestContext, YabHook, YabModule } from "@yab/core";

export type HelmetOptions = {
	contentSecurityPolicy?: boolean | Record<string, any>;
	dnsPrefetchControl?: boolean | Record<string, any>;
	expectCt?: boolean | Record<string, any>;
	frameguard?: boolean | Record<string, any>;
	hidePoweredBy?: boolean | Record<string, any>;
	hsts?: boolean | Record<string, any>;
	ieNoOpen?: boolean | Record<string, any>;
	noSniff?: boolean | Record<string, any>;
	permittedCrossDomainPolicies?: boolean | Record<string, any>;
	referrerPolicy?: boolean | Record<string, any>;
	xssFilter?: boolean | Record<string, any>;
};

@Module()
export class HelmetModule extends YabModule<HelmetOptions> {
	constructor(public config: HelmetOptions) {
		super();
	}

	@YabHook("app:response")
	async helmetHook(_: RequestContext, response: Response) {
		if (this.config.contentSecurityPolicy) {
			response.headers.set("Content-Security-Policy", "default-src 'self';");
		}

		if (this.config.dnsPrefetchControl) {
			response.headers.set("X-DNS-Prefetch-Control", "off");
		}

		if (this.config.expectCt) {
			response.headers.set("Expect-CT", "max-age=0");
		}

		if (this.config.frameguard) {
			response.headers.set("X-Frame-Options", "SAMEORIGIN");
		}

		if (this.config.hidePoweredBy) {
			response.headers.set("X-Powered-By", "Yab");
		}

		if (this.config.hsts) {
			response.headers.set(
				"Strict-Transport-Security",
				"max-age=15552000; includeSubDomains",
			);
		}

		if (this.config.ieNoOpen) {
			response.headers.set("X-Download-Options", "noopen");
		}

		if (this.config.noSniff) {
			response.headers.set("X-Content-Type-Options", "nosniff");
		}

		if (this.config.permittedCrossDomainPolicies) {
			response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
		}

		if (this.config.referrerPolicy) {
			response.headers.set("Referrer-Policy", "no-referrer");
		}

		if (this.config.xssFilter) {
			response.headers.set("X-XSS-Protection", "1; mode=block");
		}

		return response;
	}
}
