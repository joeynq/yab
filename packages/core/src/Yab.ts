import type { Serve } from "bun";
import { ContainerBuilder } from "diod";
import { type YabEventMap, YabEvents } from "./events/YabEvents";
import type { HookMetadata } from "./interfaces/Hook";
import type { ModuleConstructor, YabOptions } from "./interfaces/Module";
import { Configuration } from "./services/Configuration";
import { Hooks } from "./services/Hooks";
import { HookMetadataKey } from "./symbols/metadata";

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#container = new ContainerBuilder();

	get bunOptions(): Serve {
		return {
			...this.#config.bunOptions,
			fetch: this.#fetch.bind(this),
		};
	}

	constructor(options?: YabOptions) {
		this.#config = new Configuration(options);
		this.#container.register(Configuration).useFactory(() => this.#config);
	}

	#initModules() {
		const modConf = this.#config.options.modules ?? [];
		modConf.map(([mod, ...args]) => {
			const instance = new mod(...args);
			this.#container.register(mod).useInstance(instance);

			const hookMetadata = Reflect.getMetadata(
				HookMetadataKey,
				mod.prototype,
			) as HookMetadata<typeof YabEvents> | undefined;
			if (hookMetadata) {
				// @ts-expect-error
				const handler = mod[hookMetadata.method].bind(mod);
				handler && this.#hooks.register(hookMetadata.event, handler);
			}

			return instance;
		});
	}

	#fetch(request: Request): Promise<Response> {
		this.#hooks.invoke(YabEvents.OnRequest, request);
		throw new Error("Not implemented");
	}

	use<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): this {
		this.#config.setModuleOptions(module, ...args);
		return this;
	}

	start(onStarted: () => void) {
		this.#initModules();
		this.#container.build();
		Bun.serve(this.bunOptions);
		this.#hooks.invoke(YabEvents.OnStarted);
		onStarted();
	}
}
