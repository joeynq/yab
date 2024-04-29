import { URL } from "node:url";
import { Injectable } from "@yab/core";
import { ensure } from "@yab/utils";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Strategy } from "./Strategy";

export type BearerTokenAuthorize = {
	audience?: string;
	issuer: string;
};

@Injectable()
export class BearerAuth extends Strategy<BearerTokenAuthorize> {
	tokenType = "Bearer";
	async #createJwkSet() {
		const discoveryUrl = `${this.config.options.issuer}/.well-known/openid-configuration`;
		const response = await fetch(discoveryUrl);
		const data = (await response.json()) as {
			jwks_uri: string;
		};

		const jwksUrl = data.jwks_uri;
		const url = new URL(jwksUrl);
		// @ts-expect-error
		return createRemoteJWKSet(url);
	}

	async verify() {
		ensure(this.token, "Token is required");
		const jwks = await this.#createJwkSet();
		return jwtVerify(this.token, jwks, {
			audience: this.config.options.audience,
			issuer: this.config.options.issuer,
		});
	}
}
