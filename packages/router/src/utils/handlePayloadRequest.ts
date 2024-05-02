import type { TSchema } from "@sinclair/typebox";
import fastQueryString from "fast-querystring";
import type { FindResult } from "memoirist";
import { StandardValidator } from "typebox-validators";
import { ValidationError } from "../exceptions";
import type { RouteMatch, RouteParameter } from "../interfaces";

export const getPayloadRequest = (
	request: Request,
	match: FindResult<RouteMatch>,
) => {
	const url = new URL(request.url);
	return (
		match.store.route.parameters
			?.sort((a: RouteParameter, b: RouteParameter) => a.index - b.index)
			.map((arg: RouteParameter) => {
				if (arg.in === "query") {
					return {
						...arg,
						payload: fastQueryString.parse(url.search.replace("?", "")),
					};
				}
				if (arg.in === "params") {
					return {
						...arg,
						payload: match.params,
					};
				}

				// if (arg.in === "body") {
				//   return {
				//     ...arg,
				//     payload: match.params,
				//   };
				// }
				return {
					...arg,
					payload: null,
				};
			}) || []
	);
};

export async function validatePayloadRequest(
	schema: TSchema,
	payload: unknown,
) {
	const value = <Readonly<unknown>>payload;
	const validator = new StandardValidator(schema);
	if (!validator.test(value)) {
		const validatorErrors = validator.testReturningErrors(value);

		if (validatorErrors) {
			const errors: Error[] = [];

			for (const err of validatorErrors) {
				errors.push({ name: err.path, message: err.message, cause: err });
			}
			throw new ValidationError("Validate failed", errors);
		}
	}
}
