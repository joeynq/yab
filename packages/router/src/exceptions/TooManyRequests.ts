import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class TooManyRequests extends RouterException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.TooManyRequests, message, cause);
	}
}
