import { HttpErrorCodes, HttpException } from "@yab/core";

export class TooManyRequests extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.TooManyRequests, message, cause);
	}
}
