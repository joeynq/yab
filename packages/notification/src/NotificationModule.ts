import {
	type InitContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import type { AdapterConfigMap } from "./interfaces/channelMap";
import type { Templates } from "./interfaces/interface";
import { NotificationService } from "./services";

export const NotificationModuleKey = Symbol("NotificationModuleKey");

export type NotificationModuleConfig<T extends Templates> = {
	channels: Partial<AdapterConfigMap>;
	templates: T;
};

export class NotificationModule<T extends Templates> extends Module<
	NotificationModuleConfig<T>
> {
	#service: NotificationService;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: NotificationModuleConfig<T>) {
		super();
		this.#service = new NotificationService(config);
	}

	@YabHook("app:exit")
	async exit() {
		this.#service.unmount();
	}

	@YabHook("app:init")
	async init({ container }: InitContext) {
		container.registerValue(NotificationModuleKey, this.#service);

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
