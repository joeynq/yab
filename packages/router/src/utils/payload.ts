import type { TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { parse } from "fast-querystring";
import type { FindResult } from "memoirist";
import { StandardValidator, ValidationException } from "typebox-validators";
import type {
	Parameter,
	RequestBody,
	RouteMatch,
	ValidationFn,
} from "../interfaces";

const isFormData = (request: Request) => {
	const contentType = request.headers.get("content-type");
	return contentType?.includes("application/x-www-form-urlencoded");
};

const isMultiPart = (request: Request) => {
	const contentType = request.headers.get("content-type");
	return contentType?.includes("multipart/form-data");
};

const getFromRequest = async (
	request: Request,
	from: "query" | "header" | "cookie" | "body",
) => {
	const url = new URL(request.url);

	switch (from) {
		case "query":
			return parse(url.search.replace("?", ""));
		case "header":
			return Object.fromEntries(request.headers);
		case "cookie":
			return Object.fromEntries(
				request.headers
					.get("cookie")
					?.split(";")
					.map((cookie) => cookie.split("=")) || [],
			);
		default:
	}

	if (isMultiPart(request)) {
		return request.formData();
	}

	return isFormData(request) ? parse(await request.text()) : request.json();
};

export const getRequestPayload = async (
	request: Request,
	match: FindResult<RouteMatch>,
) => {
	if (!match.store.args) {
		return [];
	}

	const args = match.store.args;

	return Promise.all(
		args.map(async (arg: RequestBody | Parameter) => {
			const raw =
				arg.in === "path"
					? match.params
					: await getFromRequest(request, arg.in);

			const payload = arg.schema ? transform(arg.schema, raw) : raw;
			return {
				...arg,
				payload,
			};
		}),
	);
};

export const transform = <T>(schema: TSchema, value: any): T => {
	return Value.Convert(schema, value) as T;
};

export const validate: ValidationFn = async (schema, value): Promise<void> => {
	const validator = new StandardValidator(schema);
	if (!validator.test(value)) {
		const errors = validator.testReturningErrors(value);

		if (errors) {
			throw new ValidationException("Validation failed", Array.from(errors));
		}
	}
};

export const getRequestScope = (method: string, path: string) => {
	return `${method}${path}`.replace(/\/$/, "").toLowerCase();
};
