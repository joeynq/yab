import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	asValue,
} from "@vermi/core";
import type { CacheAdapter } from "./interfaces";

export type CacheModuleOptions<Adapter extends CacheAdapter> = {
	adapter: Adapter;
	clearOnStart?: boolean;
};

@Module()
export class CacheModule<Adapter extends CacheAdapter> {
	@Logger()
	protected logger!: LoggerAdapter;

	@Config()
	public config!: CacheModuleOptions<Adapter>;

	@AppHook("app:init")
	async init(context: AppContext) {
		if (this.config.clearOnStart) {
			this.logger.info("Clearing cache on start.");
			await this.config.adapter.clear();
		}
		context.register("cache", asValue(this.config.adapter));
		this.logger.info(
			`Cache module initialized with ${this.config.adapter.constructor.name}.`,
		);
	}
}
