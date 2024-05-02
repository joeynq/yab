export class ValidationError extends Error {
	constructor(
		message: string,
		private errors: Error[],
	) {
		super(message);
	}

	toJSON() {
		return {
			message: this.message,
			errors: this.errors,
		};
	}
}
