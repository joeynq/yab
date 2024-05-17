import { URL } from "node:url";
import { UseCache } from "@vermi/cache";
import { ensure } from "@vermi/utils";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { SecurityScheme } from "../interfaces";
import { Strategy } from "./Strategy";

export type BearerTokenAuthorize = {
	audience?: string;
	issuer: string;
};

export class BearerAuth extends Strategy<BearerTokenAuthorize> {
	readonly securityScheme: SecurityScheme = {
		type: "http",
		bearerFormat: "JWT",
		scheme: "bearer",
	};

	tokenType = "Bearer";
	openIdConfig:
		| {
				jwks_uri: string;
		  }
		| undefined;

	@UseCache()
	async fetchJwks(issuer: string) {
		const discoveryUrl = `${issuer}/.well-known/openid-configuration`;
		const response = await fetch(discoveryUrl);
		return (await response.json()) as {
			jwks_uri: string;
		};
	}

	async createJwkSet() {
		if (!this.openIdConfig?.jwks_uri) {
			this.openIdConfig = await this.fetchJwks(this.config.options.issuer);
		}
		// @ts-expect-error
		return createRemoteJWKSet(new URL(this.openIdConfig?.jwks_uri));
	}

	async verify(token?: string) {
		ensure(token, "Token is required");
		const jwks = await this.createJwkSet();

		return jwtVerify(token, jwks, {
			audience: this.config.options.audience,
			issuer: this.config.options.issuer,
		});
	}

	init = async () => {
		this.openIdConfig = await this.fetchJwks(this.config.options.issuer);
	};
}
