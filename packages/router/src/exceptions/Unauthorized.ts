import { HttpErrorCodes, HttpException } from "@yab/core";

export class Unauthorized extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.Unauthorized, message);
	}
}
