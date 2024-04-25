import {
	Configuration,
	Injectable,
	type Module,
	PropInject,
	type YabEventMap,
	YabHook,
} from "@yab/core";
import { deepMerge } from "@yab/utils";
import type { RouterConfig, SlashedPath } from "./interfaces";

@Injectable()
export class RouterModule implements Module<RouterConfig> {
	config: RouterConfig;
	constructor(prefix: SlashedPath, controllers: unknown[]) {
		if (!controllers.length) {
			throw new Error("No controllers provided");
		}
		this.config = {
			[prefix]: controllers,
		};
	}

	@YabHook("app:init")
	init({ config: service, container }: YabEventMap["app:init"][0]) {
		const config = service.getModuleOptions(this);

		service.setModuleOptions(this, deepMerge(config, this.config));
		container.registerValue(Configuration, service);
	}
}
