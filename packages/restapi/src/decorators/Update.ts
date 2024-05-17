import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { BadRequest, NotFound, Put } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { Single } from "../models";
import { SingularName } from "./Resource";

export function Update(resource: Class<any>) {
	const name = resource.prototype[SingularName];
	return useDecorators(
		Put(`/:${name.toLowerCase()}_id`),
		Responses(200, generic(Single).of(resource)),
		Responses(400, new BadRequest("").toSchema()),
		Responses(404, new NotFound("").toSchema()),
	);
}
