import type { TSchema } from "@sinclair/typebox";
import type { ContentType, MediaType } from "@vermi/router";
import type { RouterException } from "@vermi/router/dist/exceptions/RouterException";
import type { Class } from "@vermi/utils";

export const createResponse = (
	schema: TSchema,
): { content: Map<ContentType, MediaType> } => {
	const content = new Map<ContentType, MediaType>();
	content.set("application/json", { schema });
	return { content };
};

export const createExceptionResponse = <T extends RouterException>(
	exception: Class<T>,
) => {
	return createResponse(new exception("", {}).toSchema());
};
