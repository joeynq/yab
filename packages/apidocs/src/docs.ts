import type { UseModule } from "@vermi/core";
import type { SlashedPath } from "@vermi/router";
import { ApiDocsModule } from "./ApiDocsModule";
import type { ApiConfig } from "./interfaces";

export const docs = (
	mount: SlashedPath,
	options: ApiConfig,
): UseModule<ApiDocsModule> => {
	return [ApiDocsModule, [{ ...options, mount }]];
};
