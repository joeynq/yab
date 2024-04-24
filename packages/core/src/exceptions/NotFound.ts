import { HttpErrorCodes } from "../enum/http";
import { HttpException } from "./HttpException";

export class NotFound extends HttpException {
	constructor(message: string) {
		super(HttpErrorCodes.NotFound, message);
	}
}
