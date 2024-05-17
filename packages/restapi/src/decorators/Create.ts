import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { BadRequest, Conflict, Post } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { Single } from "../models";

export function Create(resource: Class<any>) {
	return useDecorators(
		Post("/"),
		Responses(201, generic(Single).of(resource)),
		Responses(400, new BadRequest("").toSchema()),
		Responses(409, new Conflict("").toSchema()),
	);
}
