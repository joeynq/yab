import { HttpException } from "@yab/core";
import { InternalServerError } from "../exceptions";
import type { RouteObject } from "../interfaces";
import { Res } from "./Res";

export const handleError = (error: Error) => {
	if (error instanceof HttpException) {
		return error.toResponse();
	}

	return new InternalServerError(error.message).toResponse();
};

export const handleResponse = <T>(
	result: T,
	responseConfig: RouteObject["response"],
) => {
	if (result instanceof Response) {
		return result;
	}

	if (responseConfig?.[204]) {
		return Res.empty();
	}

	const successStatus = 200;
	if (responseConfig?.[201]) {
		const { contentType } = responseConfig[successStatus];
		return Res.created(result, { "Content-Type": contentType });
	}
	if (responseConfig?.[200]) {
		const { contentType } = responseConfig[successStatus];
		return Res.ok(result, { "Content-Type": contentType });
	}

	return Res.ok(result);
};
