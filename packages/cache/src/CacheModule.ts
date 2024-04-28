import { type EnhancedContainer, Module, YabHook } from "@yab/core";
import type { AnyClass, Dictionary } from "../../utils/dist";
import type { CacheAdapter } from "./interfaces/CacheAdapter";

export const CacheModuleKey = Symbol("CacheModule");

export interface CacheModuleOptions<Adapter extends CacheAdapter> {
	adapter: AnyClass<Adapter>;
	options: ConstructorParameters<AnyClass<Adapter>>[0] & Dictionary;
}

export class CacheModule<Adapter extends CacheAdapter> extends Module<
	CacheModuleOptions<Adapter>["options"]
> {
	#adapter: Adapter;
	config: CacheModuleOptions<Adapter>["options"] & Dictionary;

	constructor(options: CacheModuleOptions<Adapter>) {
		super();
		this.#adapter = new options.adapter(options.options);
		this.config = options.options;
	}

	@YabHook("app:init")
	async init({ container }: { container: EnhancedContainer }) {
		container.registerValue(this.#adapter.constructor.name, this.#adapter);
	}
}
