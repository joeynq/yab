import {
	type Context,
	type EnhancedContainer,
	type Logger,
	LoggerKey,
	Module,
	YabHook,
} from "@yab/core";
import { asValue } from "awilix";
import {
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
	}

	@YabHook("app:init")
	async init({ container }: { container: EnhancedContainer }) {
		container.register({
			[LoggerKey.toString()]: asValue(this.service.logger),
		});
	}

	@YabHook("app:request")
	async applyContext(ctx: Context) {
		await this.service.useRequestContext(ctx);
	}
}
