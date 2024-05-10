import { HttpErrorCodes, HttpException } from "@yab/core";

export class Unauthorized extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.Unauthorized, message, cause);
	}
}
