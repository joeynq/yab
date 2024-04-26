import { HttpErrorCodes, HttpException } from "@yab/core";

export class InternalServerError extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.InternalServerError, message);
	}
}
