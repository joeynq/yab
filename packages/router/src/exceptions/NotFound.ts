import { HttpErrorCodes, HttpException } from "@yab/core";

export class NotFound extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.NotFound, message);
	}
}
