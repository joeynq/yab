import { Type } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import type { Response } from "@vermi/router";
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
	for (const [code, response] of responses) {
		if (code === 204) {
			responsesObj[String(code)] = {
				description: `HTTP ${code} Response`,
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
