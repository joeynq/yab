import { parse } from "fast-querystring";
import type { FindResult } from "memoirist";
import { StandardValidator, ValidationException } from "typebox-validators";
import type { RouteMatch, RouteParameter, ValidationFn } from "../interfaces";

const getFromRequest = async (
	request: Request,
	from: "params" | "query" | "body" | "headers" | "cookie",
) => {
	const url = new URL(request.url);
	const body = await request.json();

	switch (from) {
		case "query":
			return parse(url.search.replace("?", ""));
		case "body":
			return body;
		case "headers":
			return Object.fromEntries(request.headers);
		case "cookie":
			return Object.fromEntries(
				request.headers
					.get("cookie")
					?.split(";")
					.map((cookie) => cookie.split("=")) || [],
			);
		default:
			return undefined;
	}
};

export const getRequestPayload = async (
	request: Request,
	match: FindResult<RouteMatch>,
) => {
	if (!match.store.parameters) {
		return [];
	}

	const args = match.store.parameters.sort(
		(a: RouteParameter, b: RouteParameter) => a.index - b.index,
	);

	return Promise.all(
		args.map(async (arg: RouteParameter) => {
			if (arg.in === "params") {
				return {
					...arg,
					payload: match.params,
				};
			}

			const payload = await getFromRequest(request, arg.in);

			return {
				...arg,
				payload,
			};
		}),
	);
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
