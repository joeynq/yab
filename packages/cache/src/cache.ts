import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { CacheModule, type CacheModuleOptions } from "./CacheModule";
import type { CacheAdapter } from "./interfaces";

export const cache = <Adapter extends CacheAdapter>(
	options: Omit<CacheModuleOptions<Adapter>, "adapter">,
	adapter: Class<Adapter>,
	...args: ConstructorParameters<Class<Adapter>>
): UseModule<Class<CacheModule<Adapter>>, CacheModuleOptions<Adapter>> => {
	const adapterInstance = new adapter(...args);
	return {
		module: CacheModule,
		args: {
			adapter: adapterInstance,
			...options,
		},
	};
};
