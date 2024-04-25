import type { BunFile } from "bun";
import { HttpErrorCodes, HttpRedirectCodes, HttpSuccessCodes } from "../enum";
import { HttpException, InternalServerError } from "../exceptions";

const response = (status: number, data: unknown) => {
	return new Response(data ? JSON.stringify(data) : null, {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export const Res = {
	file(data: BunFile) {
		return new Response(data, {
			status: HttpSuccessCodes.Ok,
			headers: {
				"Content-Type": "application/octet-stream",
			},
		});
	},
	empty() {
		return response(HttpSuccessCodes.NoContent, null);
	},
	ok(data: unknown) {
		return response(HttpSuccessCodes.Ok, { data });
	},
	created(data: unknown) {
		return response(HttpSuccessCodes.Created, { data });
	},
	error(error: Error) {
		if (error instanceof HttpException) {
			return response(error.status, { error: error.toJSON() });
		}
		return response(HttpErrorCodes.InternalServerError, {
			error: new InternalServerError(error.message).toJSON(),
		});
	},
	redirect(url: string, status = HttpRedirectCodes.MovedPermanently) {
		return new Response(null, {
			status,
			headers: {
				Location: url,
			},
		});
	},
};
