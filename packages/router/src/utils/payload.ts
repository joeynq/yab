import type { TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import type { _RequestContext } from "@vermi/core";
import { ValidationException } from "typebox-validators";
import type { HTTPMethod, ValidationFn } from "../interfaces";

export const getValue = (
	from: "path" | "query" | "header" | "cookie" | "body",
	payload: _RequestContext["payload"],
) => {
	switch (from) {
		case "path":
			return payload.params;
		case "query":
			return payload.query;
		case "header":
			return payload.headers;
		case "cookie":
			return payload.cookies;
		case "body":
			return payload.body;
	}
};

export const transform = <T>(schema: TSchema, value: any): T => {
	return Value.Convert(schema, value) as T;
};

export const validate: ValidationFn = async (schema, value): Promise<void> => {
	const C = TypeCompiler.Compile(schema);

	const errors = [...C.Errors(value)];

	if (errors.length) {
		throw new ValidationException("Validation failed", errors);
	}
};

export const getRequestScope = (method: HTTPMethod, path: string) => {
	return `${method}${path}`.replace(/\/$/, "");
};
