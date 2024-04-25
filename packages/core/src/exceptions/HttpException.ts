import type { HttpErrorCodes } from "../enum";

export abstract class HttpException extends Error {
	constructor(
		public readonly status: HttpErrorCodes,
		message: string,
	) {
		super(message);
	}

	toJSON() {
		return {
			status: this.status,
			message: this.message,
		};
	}
}
