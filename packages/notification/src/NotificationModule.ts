import {
	type AppContext,
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import type { AdapterConfigMap, Templates } from "./interfaces";
import { NotificationService } from "./services";

export type NotificationModuleConfig<T extends Templates> = {
	channels: Partial<AdapterConfigMap>;
	templates: T;
};

@Module()
export class NotificationModule<T extends Templates> extends VermiModule<
	NotificationModuleConfig<T>
> {
	#service: NotificationService;

	constructor(
		protected configuration: Configuration,
		private logger: LoggerAdapter,
	) {
		super();
		this.#service = new NotificationService(this.config);
	}

	@AppHook("app:exit")
	async exit() {
		this.#service.unmount();
	}

	@AppHook("app:init")
	async init(container: AppContext) {
		container.register("notification", asValue(this.#service));

		this.#service.onError((message) => {
			this.logger.error(message);
		});

		this.#service.onMessage((data) => {
			this.logger.info(data);
		});

		this.#service.send({
			channel: "email",
			template: "sample",
			data: { name: "John Doe" },
			to: "nguyenquocdat.vn@gmail.com",
		});
	}
}
