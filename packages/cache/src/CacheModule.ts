import {
	type InitContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import type { CacheAdapter } from "./interfaces/CacheAdapter";

export const CacheModuleKey = Symbol("CacheModule");

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
	async init({ container }: InitContext) {
		if (this.config.clearOnStart) {
			this.logger.info("Clearing cache on start.");
			await this.config.adapter.clear();
		}
		container.registerValue(CacheModuleKey, this.config.adapter);
		this.logger.info(
			`Cache module initialized with ${this.config.adapter.constructor.name}.`,
		);
	}
}
