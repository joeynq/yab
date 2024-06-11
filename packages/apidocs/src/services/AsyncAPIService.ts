import { type SecuritySchemeObject } from "openapi3-ts/oas31";
import type { AsyncAPIConfig } from "../interfaces";
import type { AsyncAPIObject } from "../interfaces/AsyncAPI";
import { BaseAPIService } from "./BaseAPIService";

export interface BuildSpecsOptions {
	serverUrl: string;
	title: string;
	casing?: "camel" | "snake" | "pascal" | "kebab";
}

export class AsyncAPIService extends BaseAPIService<AsyncAPIConfig> {
	protected defaultSpecs: AsyncAPIObject = {
		asyncapi: "3.0.0",
		info: {
			title: "Vermi API",
			version: "1.0.0",
		},
		components: {},
	};

	constructor(public config: AsyncAPIConfig) {
		super(config);
	}

	addSecuritySchemes(scheme: Record<string, SecuritySchemeObject>) {
		for (const [key, value] of Object.entries(scheme)) {
			// this.#builder.addSecurityScheme(key, value);
		}
	}

	async buildSpecs({ serverUrl, title, casing }: BuildSpecsOptions) {
		this.chooseCasing(casing);
	}
}
