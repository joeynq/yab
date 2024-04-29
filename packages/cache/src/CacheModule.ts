import {
	type EnhancedContainer,
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
		container.registerValue(CacheModuleKey.toString(), this.config.adapter);
		this.logger.info(
			`Cache module initialized with ${this.config.adapter.constructor.name}.`,
		);
	}
}
