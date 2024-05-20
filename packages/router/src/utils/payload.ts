import type { TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import { ValidationException } from "typebox-validators";
import type { ValidationFn } from "../interfaces";

export const transform = <T>(schema: TSchema, value: any): T => {
	return Value.Convert(schema, value) as T;
};

export const validate: ValidationFn = async (schema, value): Promise<void> => {
	const C = TypeCompiler.Compile(schema);

	const errors = [...C.Errors(value)];
	console.log("errors", errors);

	if (errors.length) {
		throw new ValidationException("Validation failed", errors);
	}
};

export const getRequestScope = (method: string, path: string) => {
	return `${method}${path}`.replace(/\/$/, "").toLowerCase();
};
