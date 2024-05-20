import { type TSchema } from "@sinclair/typebox";
import { UseCache } from "@vermi/cache";
import { getStoreData } from "@vermi/core";
import {
	type Operation,
	type Parameter,
	type RequestBody,
	RouterException,
	getRoutes,
} from "@vermi/router";
import { camelCase, kebabCase, pascalCase, snakeCase } from "@vermi/utils";
import {
	type OpenAPIObject,
	OpenApiBuilder,
	type OperationObject,
	type SecuritySchemeObject,
} from "openapi3-ts/oas31";
import { ModelStoreKey } from "../stores";
import * as utils from "../utils";
import { buildExceptionResponses } from "../utils/buildExceptionResponses";
import { changePropCase } from "../utils/changePropCase";
import { referTo } from "../utils/referTo";
import { removeUnused } from "../utils/removeUnused";
import { corsSchema, rateLimitSchemas } from "./builtin";

export interface OpenAPIFeatures {
	cors?: boolean;
	rateLimit?: boolean;
	default500?: boolean;
}

interface BuildSpecsOptions {
	serverUrl: string;
	title: string;
	casing?: "camel" | "snake" | "pascal" | "kebab";
}

export class OpenAPIService {
	#builder: OpenApiBuilder;

	#features: OpenAPIFeatures = {
		cors: false,
		rateLimit: false,
	};

	#casingFn?: (str: string) => string;

	constructor(rootDoc: OpenAPIObject, features?: OpenAPIFeatures) {
		this.#builder = new OpenApiBuilder();
		this.#builder.rootDoc = rootDoc;
		this;

		if (features) {
			this.#features = features;
		}
	}

	#chooseCasing(casing?: "camel" | "snake" | "pascal" | "kebab") {
		switch (casing) {
			case "camel":
				this.#casingFn = camelCase;
				break;
			case "snake":
				this.#casingFn = snakeCase;
				break;
			case "pascal":
				this.#casingFn = pascalCase;
				break;
			case "kebab":
				this.#casingFn = kebabCase;
				break;
		}
	}

	#buildOperation = (path: string, operation: Operation) => {
		const { method, route, operationId } = utils.getNames(
			path,
			operation,
			this.#casingFn,
		);

		const item: OperationObject = {
			operationId,
			responses: operation.responses,
			summary: `${method.toUpperCase()} ${route}`,
		};

		const parameterArgs = operation.args?.filter((arg) => arg.in !== "body") as
			| Parameter[]
			| undefined;

		if (parameterArgs) {
			item.parameters = utils.buildParameters(parameterArgs);
		}

		const requestBody = operation.args?.find((arg) => arg.in === "body") as
			| RequestBody
			| undefined;

		if (requestBody) {
			requestBody.name = requestBody.name || `${operationId}Body`;
			item.requestBody = utils.buildRequestBody(requestBody);
		}

		if (operation.security) {
			item.security = [Object.fromEntries(operation.security)];
		}

		const options: utils.ResponseOptions = {};

		if (this.#features.rateLimit) {
			options.headers = {
				...options.headers,
				...referTo("headers", [
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"Retry-After",
				]),
			};
		}
		if (this.#features.cors) {
			options.headers = {
				...options.headers,
				...referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		if (operation.responses) {
			item.responses = {
				...item.responses,
				...utils.buildResponses(operation.responses, options),
			};
		}

		this.#builder.addPath(route, { [method]: item });
	};

	#addSchema(schema: TSchema) {
		if (schema.type === "null") {
			return;
		}
		if (schema.$id) {
			const name = schema.$id.split("/").pop();
			const { $id, ...rest } = schema;

			let converted = rest;
			if (this.#casingFn) {
				converted = changePropCase(rest, this.#casingFn);
			}

			this.#builder.addSchema(String(name), converted);
		}
	}

	#enableCors() {
		if (this.#features.cors) {
			this.#builder.addHeader("Access-Control-Allow-Origin", corsSchema);
		}
	}

	#enableRateLimit() {
		if (this.#features.rateLimit) {
			this.#builder.addHeader("X-RateLimit-Limit", rateLimitSchemas.limit);
			this.#builder.addHeader(
				"X-RateLimit-Remaining",
				rateLimitSchemas.remaining,
			);
			this.#builder.addHeader("X-RateLimit-Reset", rateLimitSchemas.reset);
			this.#builder.addHeader("Retry-After", rateLimitSchemas.retryAfter);
		}
	}

	addSecuritySchemes(scheme: Record<string, SecuritySchemeObject>) {
		for (const [key, value] of Object.entries(scheme)) {
			this.#builder.addSecurityScheme(key, value);
		}
	}

	@UseCache()
	async buildSpecs({ serverUrl, title, casing }: BuildSpecsOptions) {
		this.#chooseCasing(casing);
		const routes = getRoutes();

		const schemas = getStoreData<TSchema[]>(ModelStoreKey);

		const url = serverUrl.replace(/\/$/, "");

		if (!this.#builder.rootDoc.servers?.some((server) => server.url === url)) {
			this.#builder.addServer({ url, "x-internal": true });
		}

		this.#builder.addTitle(title);

		this.#enableCors();
		this.#enableRateLimit();

		for (const schema of schemas) {
			this.#addSchema(schema);
			// if (schema.type === "null") {
			// 	continue;
			// }
			// if (schema.$id) {
			// 	const name = schema.$id.split("/").pop();
			// 	const { $id, ...rest } = schema;
			// 	this.#builder.addSchema(String(name), rest);
			// }
		}

		const schema = RouterException.schema;
		this.#addSchema(schema);
		// if (schema.$id) {
		// 	const name = schema.$id.split("/").pop() || "Exception";
		// 	const { $id, ...rest } = schema;
		// 	this.#addSchema(rest);
		// 	this.#builder.addSchema(name, rest);
		// }

		const options: utils.ResponseOptions = {};

		if (this.#features.rateLimit) {
			options.headers = {
				...options.headers,
				...referTo("headers", [
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"Retry-After",
				]),
			};
		}
		if (this.#features.cors) {
			options.headers = {
				...options.headers,
				...referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		const errorResponse = buildExceptionResponses(options);

		this.#builder.addResponse("RouterException", errorResponse);

		for (const [path, operation] of routes) {
			this.#buildOperation(path, operation);
		}

		return removeUnused(this.#builder.getSpec());
	}
}
