import { uuid } from "@yab/utils";
import { asValue } from "awilix";
import type { Serve, Server } from "bun";
import { container } from "./container";
import { type YabEventMap, YabEvents } from "./events";
import type { Context, ModuleConstructor, YabOptions } from "./interfaces";
import { Configuration, Hooks, Res } from "./services";
import { HookMetadataKey } from "./symbols";

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
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
		container.register({
			[Configuration.name]: asValue(this.#config),
		});
	}

	#buildContext(request: Request, response: Response) {
		return {
			request,
			response,
			container,
			requestId: uuid(),
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

	context<T extends Record<string, unknown>>(getContext: (ctx: Context) => T) {
		this.#context = getContext;
		return this;
	}

	use<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): this {
		const instance = container.registerModule(module, ...args);

		const hookMetadata = Reflect.getMetadata(
			HookMetadataKey,
			module.prototype,
		) as Record<string, (string | symbol)[]> | undefined;
		if (hookMetadata) {
			for (const [event, methods] of Object.entries(hookMetadata)) {
				for (const method of methods) {
					// @ts-expect-error
					const handler = instance[method].bind(instance);
					// @ts-expect-error
					handler && this.#hooks.register(event, handler);
				}
			}
		}

		return this;
	}

	async start(onStarted: (server: Server, config: Configuration) => void) {
		await this.#hooks.invoke(YabEvents.OnInit, {
			config: this.#config,
			container: container,
		});

		const server = Bun.serve(this.bunOptions);
		await this.#hooks.invoke(YabEvents.OnStarted, server, this.#config);
		onStarted(server, this.#config);
	}
}
