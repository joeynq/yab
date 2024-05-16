import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { type OpenAPIConfig, OpenAPIModule } from "./OpenAPIModule";

export const openapi = (
	path: string,
	options?: Omit<OpenAPIConfig, "path">,
): UseModule<Class<OpenAPIModule>, OpenAPIConfig> => {
	return {
		module: OpenAPIModule,
		args: {
			path,
			...options,
		},
	};
};
