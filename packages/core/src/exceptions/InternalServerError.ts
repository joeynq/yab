import { HttpErrorCodes } from "../enum/http";
import { HttpException } from "./HttpException";

export class InternalServerError extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.InternalServerError, message);
	}
}
