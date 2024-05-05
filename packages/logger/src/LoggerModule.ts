import {
	type AppContext,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";

export type LoggerModuleConfig<Adapter extends LoggerAdapter> = {
	adapter: Adapter;
};

export class LoggerModule<Adapter extends LoggerAdapter> extends Module<
	LoggerModuleConfig<Adapter>
> {
	constructor(public config: LoggerModuleConfig<Adapter>) {
		super();
	}

	@YabHook("app:init")
	async init(container: AppContext) {
		container.registerValue("_logger", this.config.adapter);

		this.config.adapter.log.info(
			`Logger initialized with ${this.config.adapter.constructor.name}`,
		);
	}
}
