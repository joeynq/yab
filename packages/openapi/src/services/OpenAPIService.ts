import type { TSchema } from "@sinclair/typebox";
import { UseCache } from "@vermi/cache";
import { getStoreData } from "@vermi/core";
import {
	type Operation,
	type Parameter,
	type RequestBody,
	exceptions,
	getRoutes,
} from "@vermi/router";
import {
	type OpenAPIObject,
	OpenApiBuilder,
	type OperationObject,
	type SecuritySchemeObject,
} from "openapi3-ts/oas31";
import { ModelStoreKey } from "../stores";
import * as utils from "../utils";
import { removeUnused } from "../utils/removeUnused";
import { corsSchema, rateLimitSchemas } from "./builtin";

export class OpenAPIService {
	#builder: OpenApiBuilder;

	#features: { cors?: boolean; rateLimit?: boolean } = {
		cors: false,
		rateLimit: false,
	};

	constructor(rootDoc: OpenAPIObject) {
		this.#builder = new OpenApiBuilder();
		this.#builder.rootDoc = rootDoc;
	}

	#buildOperation = (path: string, operation: Operation) => {
		const { method, route, operationId } = utils.getNames(path, operation);

		const item: OperationObject = {
			operationId: operationId,
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
			if (!options.headers) options.headers = {};
			options.headers["X-RateLimit-Limit"] = {
				$ref: "#/components/headers/X-RateLimit-Limit",
			};
			options.headers["X-RateLimit-Remaining"] = {
				$ref: "#/components/headers/X-RateLimit-Remaining",
			};
			options.headers["X-RateLimit-Reset"] = {
				$ref: "#/components/headers/X-RateLimit-Reset",
			};
		}
		if (this.#features.cors) {
			if (!options.headers) options.headers = {};
			options.headers["Access-Control-Allow-Origin"] = {
				$ref: "#/components/headers/Access-Control-Allow-Origin",
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

	#addSchema(schema: TSchema) {}

	enableRateLimit() {
		this.#features.rateLimit = true;
	}

	enableCors() {
		this.#features.cors = true;
	}

	addSecuritySchemes(scheme: Record<string, SecuritySchemeObject>) {
		for (const [key, value] of Object.entries(scheme)) {
			this.#builder.addSecurityScheme(key, value);
		}
	}

	@UseCache()
	async buildSpecs(serverUrl: string, title: string) {
		const routes = getRoutes();

		const schemas = getStoreData<TSchema[]>(ModelStoreKey);

		const url = serverUrl.replace(/\/$/, "");

		if (!this.#builder.rootDoc.servers?.some((server) => server.url === url)) {
			this.#builder.addServer({ url, "x-internal": true });
		}

		this.#builder.addTitle(title);

		if (this.#features.rateLimit) {
			this.#builder.addHeader("X-RateLimit-Limit", rateLimitSchemas.limit);
			this.#builder.addHeader(
				"X-RateLimit-Remaining",
				rateLimitSchemas.remaining,
			);
			this.#builder.addHeader("X-RateLimit-Reset", rateLimitSchemas.reset);
		}
		if (this.#features.cors) {
			this.#builder.addHeader("Access-Control-Allow-Origin", corsSchema);
		}

		for (const schema of schemas) {
			if (schema.type === "null") {
				continue;
			}
			if (schema.$id) {
				const name = schema.$id.split("/").pop();
				const { $id, ...rest } = schema;
				this.#builder.addSchema(String(name), rest);
			}
		}

		for (const Exception of exceptions) {
			const schema = new Exception("").toSchema();
			if (schema.$id) {
				const name = schema.$id.split("/").pop() || Exception.name;
				const { $id, ...rest } = schema;
				this.#builder.addSchema(name, rest);
			}
		}

		for (const [path, operation] of routes) {
			this.#buildOperation(path, operation);
		}

		return removeUnused(this.#builder.getSpec());
	}
}
