import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { CacheModule, type CacheModuleOptions } from "./CacheModule";
import type { CacheAdapter } from "./interfaces";

export const cache = <Adapter extends Class<CacheAdapter<any>>>(
	adapter: Adapter,
	args: ConstructorParameters<Adapter>[0],
	options?: Omit<CacheModuleOptions<Adapter>, "adapter" | "adapterArg"> & {
		name?: string;
	},
): UseModule<CacheModule<Adapter>> => {
	const { name = "default" } = options || {};
	return [
		CacheModule,
		[
			{
				name,
				adapter,
				adapterArg: args,
				...options,
			},
		],
	];
};
