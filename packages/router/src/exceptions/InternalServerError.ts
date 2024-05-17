import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class InternalServerError extends RouterException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.InternalServerError, message, cause);
	}
}
