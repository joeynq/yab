import { ensure } from "@yab/utils";
import { Strategy } from "./Strategy";

export type BasicTokenAuthorize = {
	username: string;
	password: string;
};

export class BasicAuth extends Strategy<BasicTokenAuthorize> {
	#encodeCredentials() {
		return btoa(
			`${this.config.options.username}:${this.config.options.password}`,
		);
	}

	async verify() {
		ensure(this.token === this.#encodeCredentials(), "Invalid credentials");
		return true;
	}
}