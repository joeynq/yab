import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { BadRequest, Conflict, Post } from "@vermi/router";
import { type Class, snakeCase } from "@vermi/utils";
import { Single } from "../models";

export function Create(resource: Class<any>) {
	return useDecorators(
		Post("/", {
			operationId: snakeCase(`create_${resource.name.toLowerCase()}`),
		}),
		Responses(201, generic(Single).of(resource)),
		Responses(400, new BadRequest("").toSchema()),
		Responses(409, new Conflict("").toSchema()),
	);
}
