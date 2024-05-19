import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { BadRequest, Get, NotFound } from "@vermi/router";
import { type Class, snakeCase } from "@vermi/utils";
import { Pagination, Single } from "../models";
import { PluralName, SingularName } from "./Resource";

export function Read(resource: Class<any> | [Class<any>]) {
	const isSingle = !Array.isArray(resource);
	const ResourceClass = isSingle ? resource : resource[0];

	const singular = ResourceClass.prototype[SingularName];
	const plural = ResourceClass.prototype[PluralName];

	return useDecorators(
		Get(isSingle ? `/:${singular.toLowerCase()}_id` : "/", {
			operationId: snakeCase(isSingle ? `get_${singular}` : `list_${plural}`),
		}),
		isSingle
			? Responses(200, generic(Single).of(ResourceClass))
			: Responses(200, generic(Pagination).of(ResourceClass)),
		Responses(400, new BadRequest("").toSchema()),
		Responses(404, new NotFound("").toSchema()),
	);
}
