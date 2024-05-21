import { type TSchema, Type, TypeGuard } from "@sinclair/typebox";
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
	type PathItemObject,
	type SecuritySchemeObject,
} from "openapi3-ts/oas31";
import { ModelStoreKey } from "../stores";
import * as utils from "../utils";
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

		if (parameterArgs?.length) {
			item.parameters = utils.buildParameters(route, parameterArgs);
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
				...utils.referTo("headers", [
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
				...utils.referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		if (operation.responses) {
			item.responses = {
				...item.responses,
				...utils.buildResponses(operation.responses, options),
			};
		}

		const pathItem: PathItemObject = {
			[method]: item,
		};

		const parameters = utils.buildPathParams(route, parameterArgs || []);
		if (parameters) {
			pathItem.parameters = parameters;
		}

		this.#builder.addPath(route, pathItem);
	};

	#changeCase(schema: TSchema) {
		if (this.#casingFn) {
			return utils.changePropCase(schema, this.#casingFn);
		}
		return schema;
	}

	#addSchemas(schemas: TSchema[]) {
		const addMore = (schema: TSchema) => {
			if (!schema.$id) {
				return;
			}
			if (schemas.every((s) => s.$id !== schema.$id)) {
				schemas.push(schema);
			}
		};
		// recursive function to find all nested schemas
		const findNested = (schema: TSchema) => {
			if (TypeGuard.IsObject(schema)) {
				const properties = schema.properties || {};

				for (const [name, value] of Object.entries(properties)) {
					if (TypeGuard.IsObject(value)) {
						if (value.$id) {
							addMore(value);
							properties[name] = Type.Ref(value.$id);
							schema.properties = properties;
						}
						findNested(value);
					} else if (TypeGuard.IsArray(value)) {
						if (value.items?.$id) {
							addMore(value.items);
							properties[name].items = Type.Ref(value.items.$id);
							schema.properties = properties;
						}
						findNested(value.items);
					}
				}
			}
		};

		for (const schema of schemas) {
			findNested(schema);
		}
		for (const schema of schemas) {
			const name = schema.$id?.split("/").pop();
			name && this.#builder.addSchema(name, schema);
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

		const unfiltered = getStoreData<TSchema[]>(ModelStoreKey).filter(
			(schema) => schema.$id,
		);
		const schemas = [
			...new Map(unfiltered.map((pos) => [pos.$id, pos])).values(),
		];

		const url = serverUrl.replace(/\/$/, "");

		if (!this.#builder.rootDoc.servers?.some((server) => server.url === url)) {
			this.#builder.addServer({ url, "x-internal": true });
		}

		this.#builder.addTitle(title);

		this.#enableCors();
		this.#enableRateLimit();

		this.#addSchemas(
			[...schemas, RouterException.schema].map((s) => this.#changeCase(s)),
		);

		const options: utils.ResponseOptions = {};

		if (this.#features.rateLimit) {
			options.headers = {
				...options.headers,
				...utils.referTo("headers", [
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
				...utils.referTo("headers", ["Access-Control-Allow-Origin"]),
			};
		}

		const errorResponse = utils.buildExceptionResponses(options);

		this.#builder.addResponse("RouterException", errorResponse);

		for (const [path, operation] of routes) {
			this.#buildOperation(path, operation);
		}

		return utils.removeUnused(this.#builder.getSpec());
	}
}
