import type { UseModule } from "@vermi/core";
import type { SlashedPath } from "@vermi/router";
import { type ApiDocsConfig, ApiDocsModule } from "./ApiDocsModule";

export const docs = (
	path: SlashedPath,
	options: ApiDocsConfig[SlashedPath],
): UseModule<ApiDocsModule> => {
	return [ApiDocsModule, { [path]: options }];
};
