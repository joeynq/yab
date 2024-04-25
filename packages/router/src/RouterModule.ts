import {
	Configuration,
	type Module,
	PropInject,
	type YabEventMap,
	YabHook,
} from "@yab/core";

type SlashedPath = `/${string}`;

export type RouterConfig = {
	[key: SlashedPath]: unknown;
};

const Injectable = (): ClassDecorator => {
	return (target) => {
		// console.log("Injectable", target);
		return target;
	};
};

@Injectable()
export class RouterModule implements Module<RouterConfig> {
	id = "yab-router";

	config: RouterConfig;

	@PropInject() private configService!: Configuration;

	constructor(prefix: SlashedPath, controllers: unknown[]) {
		if (!controllers.length) {
			throw new Error("No controllers provided");
		}
		this.config = {
			[prefix]: controllers,
		};
	}

	@YabHook("init")
	init({ config: service, container }: YabEventMap["init"][0]) {
		const config = service.getModuleOptions(this);

		service.setModuleOptions(this, {
			...config,
			...this.config,
		});
		container.registerValue(Configuration, service);
	}
}
