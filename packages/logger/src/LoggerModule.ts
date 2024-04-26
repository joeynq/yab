import {
	type Context,
	type Logger,
	Module,
	YabHook,
	container,
} from "@yab/core";
import { asValue } from "awilix";
import {
	LoggerKey,
	LoggerService,
	type LoggerServiceOptions,
} from "./services/LoggerService";

export interface LoggerModuleConfig<L extends Logger = Logger>
	extends LoggerServiceOptions<L> {}

export class LoggerModule<L extends Logger> extends Module<
	LoggerModuleConfig<L>
> {
	service: LoggerService<L>;

	constructor(public config: LoggerModuleConfig<L>) {
		super();
		this.service = new LoggerService(config);
		this.#register();
	}

	#register() {
		container.register({
			[LoggerKey.toString()]: asValue(this.service.logger),
		});
	}

	@YabHook("app:request")
	async applyContext(ctx: Context) {
		await this.service.useRequestContext(ctx);
	}
}
