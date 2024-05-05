import {
	type AppContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
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
	async init(container: AppContext) {
		if (this.config.clearOnStart) {
			this.logger.info("Clearing cache on start.");
			await this.config.adapter.clear();
		}
		container.registerValue("cache", this.config.adapter);
		this.logger.info(
			`Cache module initialized with ${this.config.adapter.constructor.name}.`,
		);
	}
}
