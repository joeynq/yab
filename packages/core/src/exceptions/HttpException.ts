import type { HttpErrorCodes } from "../enum";

export class HttpException extends Error {
	constructor(
		public readonly status: HttpErrorCodes,
		message: string,
		cause?: Error,
	) {
		super(message, { cause });
	}

	toResponse() {
		return new Response(JSON.stringify({ error: this.toJSON() }), {
			status: this.status,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	toJSON() {
		return {
			status: this.status,
			message: this.message,
		};
	}
}
