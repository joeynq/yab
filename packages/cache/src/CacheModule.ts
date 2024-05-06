import {
	type AppContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
	asValue,
} from "@yab/core";
import type { CacheAdapter } from "./interfaces/CacheAdapter";

export type CacheModuleOptions<Adapter extends CacheAdapter> = {
	adapter: Adapter;
	clearOnStart?: boolean;
};

export class CacheModule<Adapter extends CacheAdapter> extends Module<
	CacheModuleOptions<Adapter>
> {
	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: CacheModuleOptions<Adapter>) {
		super();
	}

	@YabHook("app:init")
	async init(context: AppContext) {
		if (this.config.clearOnStart) {
			this.logger.info("Clearing cache on start.");
			await this.config.adapter.clear();
		}
		console.log(context);
		context.register("cache", asValue(this.config.adapter));
		context.store.logger.info(
			`Cache module initialized with ${this.config.adapter.constructor.name}.`,
		);
	}
}
