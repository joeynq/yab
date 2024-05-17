import { type TObject, type TProperties, Type } from "@sinclair/typebox";
import { ValueErrorType } from "@sinclair/typebox/errors";
import { HttpErrorCodes } from "@vermi/core";
import { ValidationException, type ValueError } from "typebox-validators";
import { getEnumValues } from "../utils";
import { RouterException } from "./RouterException";

export class BadRequest extends RouterException {
	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.BadRequest, message, cause);
	}

	toJSON() {
		const errors: ValueError[] = [];
		if (this.cause instanceof ValidationException) {
			errors.push(...this.cause.details);
		}

		return {
			...super.toJSON(),
			errors,
		};
	}

	toSchema(): TObject<TProperties> {
		return Type.Composite(
			[
				super.toSchema(),
				Type.Object({
					errors: Type.Array(
						Type.Object({
							message: Type.String(),
							path: Type.String(),
							type: getEnumValues("number", ValueErrorType as any),
							value: Type.Any(),
						}),
					),
				}),
			],
			{ $id: `#/components/schemas/${this.constructor.name}` },
		);
	}
}
