import { type TObject, Type } from "@sinclair/typebox";
import { ValueErrorType } from "@sinclair/typebox/errors";
import { HttpException } from "@vermi/core";
import { getEnumValues, snakeCase } from "@vermi/utils";

export interface RouterExceptionStatic {
	new (...args: any[]): RouterException;
	toSchema(): TObject;
}

const errors = getEnumValues(ValueErrorType).map((s) => snakeCase(s));
const maxLength = Math.max(...errors.map((s) => s.length));

export abstract class RouterException extends HttpException {
	abstract code: string;
	errors?: { type: string; path: string; message: string }[];

	toJSON() {
		return {
			...super.toJSON(),
			code: this.code,
			errors: this.errors,
		};
	}

	static schema = Type.Object(
		{
			status: Type.Integer({ minimum: 400, maximum: 599, format: "int32" }),
			message: Type.String({ maxLength: 1024 }),
			code: Type.String({ maxLength: 64 }),
			errors: Type.Optional(
				Type.Array(
					Type.Object({
						type: Type.String({
							enum: errors,
							maxLength,
						}),
						path: Type.String({ maxLength: 1024 }),
						message: Type.String({ maxLength: 1024 }),
					}),
					{ maxItems: 30 },
				),
			),
		},
		{
			$id: "#/components/schemas/Exception",
		},
	);
}
