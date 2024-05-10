import { HttpErrorCodes, HttpException } from "@vermi/core";

export class TooManyRequests extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.TooManyRequests, message, cause);
	}
}
