import type { TSchema } from "@sinclair/typebox";
import {
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	getStoreData,
} from "@vermi/core";
import { type Parameter, type RequestBody, getRoutes } from "@vermi/router";
import { deepMerge } from "@vermi/utils";
import {
	type OpenAPIObject,
	OpenApiBuilder,
	type OperationObject,
} from "openapi3-ts/oas31";
import { renderToString } from "react-dom/server";
import { ScalarPage } from "./components";
import { ModelStoreKey } from "./stores";
import {
	buildParameters,
	buildRequestBody,
	buildResponses,
	getNames,
} from "./utils";

export interface OpenAPIConfig {
	path?: string;
	fileName?: string;
	specs?: OpenAPIObject;
	override?: boolean;
	title?: string;
}

const defaultSpecs: OpenAPIObject = {
	openapi: "3.1",
	info: {
		title: "Vermi API",
		version: "1.0.0",
	},
	components: {},
	paths: {},
};

@Module()
export class OpenAPIModule extends VermiModule<OpenAPIConfig> {
	#builder = new OpenApiBuilder();

	constructor(
		protected configuration: Configuration,
		protected logger: LoggerAdapter,
	) {
		super();

		let specs: OpenAPIObject;
		if (this.config.override) {
			specs = this.config.specs || defaultSpecs;
		} else {
			specs = deepMerge(defaultSpecs, this.config.specs || {}) as OpenAPIObject;
		}

		this.#builder.rootDoc = specs;
	}

	@AppHook("app:init")
	async init() {
		const routes = getRoutes();

		const schemas = getStoreData<TSchema[]>(ModelStoreKey);

		for (const schema of schemas) {
			if (schema.$id) {
				const name = schema.$id.split("/").pop();
				this.#builder.addSchema(name || schema.$id, schema);
			}
		}

		for (const [path, operation] of routes) {
			const { method, route, operationId } = getNames(path, operation);

			const item: OperationObject = {
				operationId: operationId,
				responses: operation.responses,
			};

			const parameterArgs = operation.args?.filter(
				(arg) => arg.in !== "body",
			) as Parameter[] | undefined;

			if (parameterArgs) {
				item.parameters = buildParameters(parameterArgs);
			}

			const requestBody = operation.args?.find((arg) => arg.in === "body") as
				| RequestBody
				| undefined;

			if (requestBody) {
				requestBody.name = requestBody.name || `${operationId}Body`;
				item.requestBody = buildRequestBody(requestBody);
			}

			if (operation.security) {
				item.security = [Object.fromEntries(operation.security)];
			}

			if (operation.responses) {
				item.responses = {
					...item.responses,
					...buildResponses(operation.responses),
				};
			}

			this.#builder.addTitle(this.config.title || "Vermi API");
			this.#builder.addPath(route, { [method]: item });
		}

		this.logger.info(
			`OpenAPI page running at ${this.config.path || "/openapi"}`,
		);
	}

	@AppHook("app:request")
	async request(context: RequestContext) {
		const {
			path = "/openapi",
			fileName = "openapi.json",
			title = "Vermi API",
		} = this.config;

		const fileUrl = `${path}/${fileName}`;

		const url = new URL(context.store.request.url);

		if (url.pathname === fileUrl) {
			const specs = this.#builder.getSpecAsJson();
			return new Response(specs, {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		if (url.pathname.startsWith(path)) {
			const page = renderToString(<ScalarPage url={fileUrl} title={title} />);

			return new Response(`<!doctype html>${page}`, {
				headers: {
					"Content-Type": "text/html",
				},
			});
		}
	}
}
