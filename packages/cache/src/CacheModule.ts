import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	type VermiModule,
	asValue,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { CacheAdapter } from "./interfaces";

export type CacheModuleOptions<Adapter extends Class<CacheAdapter<any>>> = {
	adapter: Adapter;
	adapterArg: ConstructorParameters<Adapter>[0];
	clearOnStart?: boolean;
};

@Module()
export class CacheModule<Adapter extends Class<CacheAdapter<any>>>
	implements VermiModule<Record<string, CacheModuleOptions<Adapter>>>
{
	@Logger() protected logger!: LoggerAdapter;
	@Config() public config!: Record<string, CacheModuleOptions<Adapter>>;

	@AppHook("app:init")
	async init(context: AppContext) {
		for (const [name, options] of Object.entries(this.config)) {
			const instance = new options.adapter(options.adapterArg);

			if (options.clearOnStart) {
				this.logger.info(`Clearing cache on start for ${name}.`);
				await instance.clear();
			}
			context.register(`cache.${name}`, asValue(instance));
			this.logger.info(
				`Cache module initialized with ${options.adapter.name}.`,
			);
		}
	}
}
