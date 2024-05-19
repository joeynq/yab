import { Type } from "@sinclair/typebox";
import { type HttpCodes } from "@vermi/core";
import { type Response, RouterException } from "@vermi/router";
import type {
	HeadersObject,
	ResponseObject,
	ResponsesObject,
} from "openapi3-ts/oas31";

export interface ResponseOptions {
	headers?: HeadersObject;
}

export const buildResponses = (
	responses: Map<HttpCodes, Response>,
	options?: ResponseOptions,
) => {
	const responsesObj: ResponsesObject = {};

	responsesObj["4XX"] = {
		description: "Client Error",
		...options,
		content: Type.Ref(RouterException.schema),
	} satisfies ResponseObject;

	responsesObj["429"] = {
		description: "Client Error",
		...options,
		content: Type.Ref(RouterException.schema),
	} satisfies ResponseObject;

	responsesObj["500"] = {
		description: "Internal Server Error",
		...options,
		content: Type.Ref(RouterException.schema),
	} satisfies ResponseObject;

	for (const [code, response] of responses) {
		if (code === 204) {
			responsesObj[String(code)] = {
				description: `HTTP ${code} Response`,
				...options,
			} satisfies ResponseObject;
			continue;
		}
		responsesObj[String(code)] = {
			description: `HTTP ${code} Response`,
			...options,
			content: Object.fromEntries(
				Array.from(response.content).map(([key, { schema }]) => {
					if (schema.type === "null") {
						return [key, {}];
					}
					return [
						key,
						{
							schema: schema.$id ? Type.Ref(schema) : schema,
						},
					];
				}),
			),
		} satisfies ResponseObject;
	}
	return responsesObj;
};
