import type { Serve, Server } from "bun";
import { type Container, ContainerBuilder } from "diod";
import { type YabEventMap, YabEvents } from "./events/YabEvents";
import type { Context } from "./interfaces/Context";
import type { HookMetadata } from "./interfaces/Hook";
import type { ModuleConstructor, YabOptions } from "./interfaces/Module";
import { Configuration } from "./services/Configuration";
import { Hooks } from "./services/Hooks";
import { Res } from "./services/Res";
import { HookMetadataKey } from "./symbols/metadata";

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#builder = new ContainerBuilder();
	#container!: Container;
	#context?: (ctx: Context) => Record<string, unknown>;

	get bunOptions(): Serve {
		return {
			...this.#config.bunOptions,
			fetch: (request: Request) => {
				try {
					return this.#fetch(request);
				} catch (error) {
					return Res.error(error as Error);
				}
			},
		};
	}

	constructor(options?: YabOptions) {
		this.#config = new Configuration(options);
		this.#builder.register(Configuration).useFactory(() => this.#config);
	}

	#initModules() {
		const modConf = this.#config.options.modules ?? [];
		modConf.map(([mod, ...args]) => {
			const instance = new mod(...args);
			this.#builder.register(mod).useInstance(instance);

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

	#buildContext(request: Request, response: Response) {
		return {
			request,
			response,
			container: this.#builder.build({ autowire: true }),
			requestId: crypto.randomUUID(),
		};
	}

	async #fetch(request: Request): Promise<Response> {
		const response = new Response("Served", { status: 200 });

		const context = this.#buildContext(request, response);
		await this.#hooks.invoke(YabEvents.OnRequest, {
			...context,
			...this.#context?.(context),
		});

		return response;
	}

	/**
	 * The `context` function in TypeScript returns an empty object of a specified type.
	 * @param {Context} context - The `context` parameter is of type `Context`, which is a generic type
	 * that extends `Record<string, unknown>`. This means that `context` is expected to be an object with
	 * string keys and values of any type.
	 * @returns An empty object of type T is being returned.
	 */
	context<T extends Record<string, unknown>>(getContext: (ctx: Context) => T) {
		this.#context = getContext;
		return this;
	}

	use<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): this {
		this.#config.setModuleOptions(module, ...args);
		return this;
	}

	async start(onStarted: (server: Server, config: Configuration) => void) {
		this.#initModules();

		this.#builder.build({ autowire: true });
		await this.#hooks.invoke(YabEvents.OnInit, {
			config: this.#config,
			container: this.#container,
		});

		const server = Bun.serve(this.bunOptions);
		await this.#hooks.invoke(YabEvents.OnStarted, server, this.#config);
		onStarted(server, this.#config);
	}
}
