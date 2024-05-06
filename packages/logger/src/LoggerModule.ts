import {
	type AppContext,
	type LoggerAdapter,
	Module,
	YabHook,
	asValue,
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
	async init(context: AppContext) {
		const adapter = this.config.adapter;
		context.register("_logger", asValue(adapter));

		this.config.adapter.log.info(
			`Logger initialized with ${adapter.constructor.name}`,
		);
	}
}
