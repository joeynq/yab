import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class Unauthorized extends RouterException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.Unauthorized, message, cause);
	}
}
