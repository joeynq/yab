import type { UseModule } from "@vermi/core";
import { type OpenAPIConfig, OpenAPIModule } from "./OpenAPIModule";

export const openapi = (
	path: string,
	options: Omit<OpenAPIConfig, "path">,
): UseModule<OpenAPIModule> => {
	return [
		OpenAPIModule,
		{
			path,
			...options,
		},
	];
};
