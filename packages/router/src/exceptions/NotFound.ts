import { HttpErrorCodes, HttpException } from "@vermi/core";

export class NotFound extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.NotFound, message, cause);
	}
}
