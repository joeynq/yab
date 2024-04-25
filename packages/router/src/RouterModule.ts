import {
	Configuration,
	Hooks,
	Injectable,
	type Module,
	type YabEventMap,
	YabHook,
} from "@yab/core";
import { deepMerge } from "@yab/utils";
import type { RouterEvent, RouterEventMap } from "./event/RouterEvent";
import type { RouterConfig, SlashedPath } from "./interfaces";

@Injectable()
export class RouterModule implements Module<RouterConfig> {
	config: RouterConfig;

	hooks = new Hooks<typeof RouterEvent, RouterEventMap>();

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

	@YabHook("app:request")
	async onRequest({
		request,
		response,
		container,
	}: YabEventMap["app:request"][0]) {
		// TODO
		// 1. Get the path from the request
		// 2. Find the controller and action for the path
		// 3. Invoke event beforeHandle
		// 4. Invoke the action with the request and response
		// 5. Invoke event afterHandle
		// 6. Return the response, build from result of afterHandle event
		return response;
	}
}
