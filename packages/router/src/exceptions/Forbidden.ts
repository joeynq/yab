import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class Forbidden extends RouterException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.Forbidden, message, cause);
	}
}
