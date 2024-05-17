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

export class OpenAPIService {
	#builder: OpenApiBuilder;

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

		if (operation.responses) {
			item.responses = {
				...item.responses,
				...utils.buildResponses(operation.responses),
			};
		}

		this.#builder.addPath(route, { [method]: item });
	};

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
			this.#builder.addServer({ url });
		}

		this.#builder.addTitle(title);

		for (const schema of schemas) {
			if (schema.type === "null") {
				continue;
			}
			if (schema.$id) {
				const name = schema.$id.split("/").pop();
				// biome-ignore lint/performance/noDelete: <explanation>
				delete schema.$id;
				this.#builder.addSchema(String(name), schema);
			}
		}

		for (const Exception of exceptions) {
			const schema = new Exception("").toSchema();
			if (schema.$id) {
				const name = schema.$id.split("/").pop() || Exception.name;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete schema.$id;
				this.#builder.addSchema(name, schema);
			}
		}

		for (const [path, operation] of routes) {
			this.#buildOperation(path, operation);
		}

		return removeUnused(this.#builder.getSpec());
	}
}
