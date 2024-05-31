import { pathname } from "@vermi/utils";
import type { RouterModuleConfig } from "../RouterModule";
import type { SlashedPath } from "../interfaces";

export const getConfigFromRequest = (
	config: RouterModuleConfig,
	req: Request,
) => {
	const path = pathname(req.url).split("/")[1];
	const mount = `/${path}` as SlashedPath;

	if (!config[mount]) {
		return;
	}

	return { ...config[mount], mount };
};
