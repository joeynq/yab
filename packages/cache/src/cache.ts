import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { CacheModule, type CacheModuleOptions } from "./CacheModule";
import type { CacheAdapter } from "./interfaces";

export const cache = <Adapter extends CacheAdapter>(
	options: Omit<CacheModuleOptions<Adapter>, "adapter">,
	adapter: AnyClass<Adapter>,
	...args: ConstructorParameters<AnyClass<Adapter>>
): YabUse<AnyClass<CacheModule<Adapter>>> => {
	const adapterInstance = new adapter(...args);
	return {
		module: CacheModule,
		args: [
			{
				adapter: adapterInstance,
				...options,
			},
		],
	};
};
