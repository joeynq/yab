import {
	type AppContext,
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import type { CacheAdapter } from "./interfaces/CacheAdapter";

export type CacheModuleOptions<Adapter extends CacheAdapter> = {
	adapter: Adapter;
	clearOnStart?: boolean;
};

@Module()
export class CacheModule<Adapter extends CacheAdapter> extends VermiModule<
	CacheModuleOptions<Adapter>
> {
	constructor(
		protected configuration: Configuration,
		private logger: LoggerAdapter,
	) {
		super();
	}

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
