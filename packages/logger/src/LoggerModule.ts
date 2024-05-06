import {
	type AppContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
	YabModule,
	asValue,
} from "@yab/core";

export type LoggerModuleConfig<Adapter extends LoggerAdapter> = {
	adapter: Adapter;
};

@Module()
export class LoggerModule<Adapter extends LoggerAdapter> extends YabModule<
	LoggerModuleConfig<Adapter>
> {
	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: LoggerModuleConfig<Adapter>) {
		super();
	}

	@YabHook("app:init")
	async init(context: AppContext) {
		const adapter = this.config.adapter;

		context.register("_logger", asValue(adapter));

		this.logger.info(`Logger initialized with ${adapter.constructor.name}`);
	}
}
