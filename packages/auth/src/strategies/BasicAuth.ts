import { ensure } from "@yab/utils";
import { Strategy } from "./Strategy";

export type BasicTokenAuthorize = {
	issuer: string;
	username: string;
	password: string;
};

export class BasicAuth extends Strategy<BasicTokenAuthorize> {
	tokenType = "Basic";
	#encodeCredentials() {
		return btoa(
			`${this.config.options.username}:${this.config.options.password}`,
		);
	}

	async verify(token?: string) {
		ensure(token, "Token is required");
		ensure(token === this.#encodeCredentials(), "Invalid credentials");
		return true;
	}
}
