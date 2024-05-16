import { Type } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { Responses } from "@vermi/openapi";
import { Delete as RouterDelete } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { SingularName } from "./Resource";

export function Delete(resource: Class<any>) {
	const name = resource.prototype[SingularName];
	return useDecorators(
		RouterDelete(`/:${name.toLowerCase()}_id`),
		Responses(204, Type.Void()),
	);
}
