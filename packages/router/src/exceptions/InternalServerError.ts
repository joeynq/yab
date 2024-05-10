import { HttpErrorCodes, HttpException } from "@vermi/core";

export class InternalServerError extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.InternalServerError, message, cause);
	}
}
