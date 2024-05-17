import { Type } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import type { Response } from "@vermi/router";
import type { ResponseObject, ResponsesObject } from "openapi3-ts/oas31";

export const buildResponses = (responses: Map<HttpCodes, Response>) => {
	const responsesObj: ResponsesObject = {};
	for (const [code, response] of responses) {
		responsesObj[String(code)] = {
			description: `HTTP ${code} Response`,
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
