import { HttpErrorCodes, HttpException } from "@vermi/core";
import { ValidationException, type ValueError } from "typebox-validators";

export class BadRequest extends HttpException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.BadRequest, message, cause);
	}

	toJSON() {
		const errors: ValueError[] = [];
		if (this.cause instanceof ValidationException) {
			errors.push(...this.cause.details);
		}

		return {
			...super.toJSON(),
			errors,
		};
	}
}
