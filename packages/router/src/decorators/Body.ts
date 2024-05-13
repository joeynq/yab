import type { TObject } from "@sinclair/typebox";
import type { Class } from "@vermi/utils";
import type { ContentType, RequestBody } from "../interfaces";
import type { Mapper } from "../services";

export type BodyOptions = {
	pipes?: Array<Class<Mapper>>;
	nullable?: boolean;
	contentType?: ContentType;
};

export const Body = <T extends TObject>(
	schema: T,
	{ nullable = false, contentType = "application/json" }: BodyOptions = {},
) => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		Reflect.defineMetadata(
			"design:argtypes",
			[
				...(Reflect.getMetadata("design:argtypes", target, propertyKey) || []),
				{
					in: "body" as const,
					schema,
					required: !nullable,
					index: parameterIndex,
					contentType,
				} satisfies RequestBody,
			],
			target,
			propertyKey,
		);
	};
};
