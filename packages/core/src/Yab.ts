import { type AnyFunction, deepMerge, uuid } from "@yab/utils";
import { asValue } from "awilix";
import type { Server } from "bun";
import { container } from "./container";
import { type YabEventMap, YabEvents } from "./events";
import type {
	Context,
	ModuleConfig,
	ModuleConstructor,
	YabOptions,
} from "./interfaces";
import { Configuration, Hooks } from "./services";
import { HookMetadataKey } from "./symbols";

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#context?: (ctx: Context) => Record<string, unknown>;

	constructor(options?: YabOptions) {
		this.#config = new Configuration(options);
		container.register({
			[Configuration.name]: asValue(this.#config),
		});
	}

	#buildContext(request: Request): Context {
		const defaultContext: Context = {
			request,
			container,
			requestId: uuid(),
		};
		return {
			...defaultContext,
			...(this.#context ? this.#context(defaultContext) : {}),
		};
	}

	#registerHooksFromModule(instance: InstanceType<ModuleConstructor>) {
		const hookMetadata = this.#config.getModuleConfig(instance)?.hooks;
		if (hookMetadata) {
			for (const [event, handlers] of Object.entries(hookMetadata)) {
				for (const handler of handlers) {
					// @ts-expect-error
					this.#hooks.register(event, handler);
				}
			}
		}
	}

	#initModules() {
		const moduleConfigs = this.#config.options.modules;
		for (const { name } of moduleConfigs) {
			const module = container.resolve(name);

			this.#registerHooksFromModule(module);
		}
	}

	context<T extends Record<string, unknown>>(getContext: (ctx: Context) => T) {
		this.#context = getContext;
		return this;
	}

	use<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): this {
		const instance = container.registerModule(module, ...args);
		const config: ModuleConfig = {
			name: module.name,
			id: instance.id,
			config: instance.config,
			hooks: {},
		};

		const hookMetadata = Reflect.getMetadata(
			HookMetadataKey,
			module.prototype,
		) as Record<string, (string | symbol)[]> | undefined;

		if (hookMetadata) {
			for (const [event, methods] of Object.entries(hookMetadata)) {
				for (const method of methods) {
					// @ts-expect-error
					const handler = instance[method].bind(instance) as AnyFunction;
					if (handler) {
						config.hooks = deepMerge(config.hooks, {
							[event]: [handler],
						});
					}
				}
			}
		}

		this.#config.setModuleConfig(instance, config);

		return this;
	}

	async start(onStarted: (server: Server, config: Configuration) => void) {
		this.#initModules();
		await this.#hooks.invoke(YabEvents.OnInit, [
			{
				config: this.#config,
				container: container,
			},
		]);

		const hooks = this.#hooks;
		const buildContext = this.#buildContext.bind(this);

		const server = Bun.serve({
			...this.#config.bunOptions,
			async fetch(request: Request): Promise<Response> {
				const context = buildContext(request);
				const response = await hooks.invoke(YabEvents.OnRequest, [context], {
					breakOnResult: true,
				});

				return response || new Response("OK", { status: 200 });
			},
		});
		await this.#hooks.invoke(YabEvents.OnStarted, [server, this.#config]);
		onStarted(server, this.#config);
	}
}
