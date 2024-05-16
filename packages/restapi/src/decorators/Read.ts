import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { Get } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { Pagination, Single } from "../models";
import { SingularName } from "./Resource";

export function Read(resource: Class<any> | [Class<any>]) {
	const isSingle = !Array.isArray(resource);
	const ResourceClass = isSingle ? resource : resource[0];

	const name = ResourceClass.prototype[SingularName];

	return useDecorators(
		Get(isSingle ? `/:${name.toLowerCase()}_id` : "/"),
		isSingle
			? Responses(200, generic(Single).of(ResourceClass))
			: Responses(200, generic(Pagination).of(ResourceClass)),
	);
}
