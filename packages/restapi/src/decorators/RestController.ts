import { useDecorators } from "@vermi/core";
import { Controller, type SlashedPath } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { PluralName } from "./Resource";

export function RestController(resource: Class<any>) {
	return useDecorators(
		Controller(
			`/${resource.prototype[PluralName]}`.toLowerCase() as SlashedPath,
		),
	);
}
