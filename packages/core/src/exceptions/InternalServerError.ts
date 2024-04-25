import { HttpErrorCodes } from "../enum";
import { HttpException } from "./HttpException";

export class InternalServerError extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.InternalServerError, message);
	}
}
