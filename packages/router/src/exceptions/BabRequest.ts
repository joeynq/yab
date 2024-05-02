import { HttpErrorCodes, HttpException } from "@yab/core";

export class BadRequest extends HttpException {
	constructor(
		message: string,
		public errors?: Error[],
	) {
		super(HttpErrorCodes.BadRequest, message);
	}

	toJSON() {
		return {
			status: HttpErrorCodes.BadRequest,
			message: this.message,
			errors: this.errors,
		};
	}
}
