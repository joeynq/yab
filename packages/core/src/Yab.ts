import { type AnyFunction, deepMerge, uuid } from "@yab/utils";
import type { Server } from "bun";
import { useContainerRef } from "./container";
import { EnvKey } from "./decorators";
import { type YabEventMap, YabEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	Context,
	LoggerAdapter,
	ModuleConfig,
	ModuleConstructor,
	YabOptions,
} from "./interfaces";
import { Configuration, ContextService, Hooks } from "./services";
import { ConsoleLogger } from "./services/ConsoleLogger";
import { HookMetadataKey, LoggerKey } from "./symbols";
import { getModuleToken } from "./utils/moduleToken";

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#context = new ContextService();
	#container = useContainerRef();

	#customContext?: (ctx: Context) => Record<string, unknown>;

	constructor(options?: Partial<YabOptions>) {
		this.#config = new Configuration({
			...options,
			modules: options?.modules || [],
		});
		this.#container.registerValue(Configuration, this.#config);
		this.#container.registerValue(ContextService, this.#context);
		this.#container.registerValue(LoggerKey, new ConsoleLogger("info"));
		this.#container.registerValue(EnvKey, options?.env || {});
		this.#container.registerValue(Hooks, this.#hooks);
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
		for (const config of moduleConfigs) {
			const module = this.#container.resolve(
				getModuleToken(config.name, config.id),
			);
			this.#registerHooksFromModule(module);
		}
	}

	#buildContext(request: Request, server: Server) {
		const context: Context = {
			requestId: request.headers.get("x-request-id") || uuid(),
			logger: new ConsoleLogger(this.#config.options.logLevel || "info"),
			container: this.#container,
			request,
			serverUrl: server.url.toString(),
			userIp: server.requestIP(request) || undefined,
			useAgent: request.headers.get("user-agent") || undefined,
		};
		return {
			...context,
			...this.#customContext?.(context),
		};
	}

	#runWithContext(initContext: Context) {
		return new Promise<Response>((resolve) => {
			this.#context.runWithContext(initContext, async () => {
				try {
					const context = this.#context.context || initContext;

					const response = await this.#hooks.invoke(
						YabEvents.OnRequest,
						[context],
						{
							breakOnResult: true,
						},
					);

					return resolve(response || new Response("OK", { status: 200 }));
				} catch (error) {
					if (error instanceof HttpException) {
						return resolve(error.toResponse());
					}

					return resolve(
						new HttpException(500, (error as Error).message).toResponse(),
					);
				}
			});
		});
	}

	context<T extends Record<string, unknown>>(getContext: (ctx: Context) => T) {
		this.#customContext = getContext;
		return this;
	}

	use<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): this {
		const instance = this.#container.registerModule(module, ...args);
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
				container: this.#container,
				app: this,
			},
		]);

		const logger = this.#container.resolveValue<LoggerAdapter>(LoggerKey);

		const self = this;

		const server = Bun.serve({
			...this.#config.bunOptions,
			async fetch(request, server): Promise<Response> {
				const initContext = self.#buildContext(request, server);
				return self.#runWithContext(initContext);
			},
		});
		await this.#hooks.invoke(YabEvents.OnStarted, [server, this.#config]);

		for (const eventType of [
			"SIGINT",
			"SIGUSR1",
			"SIGUSR2",
			"uncaughtException",
			"SIGTERM",
		]) {
			process.on(eventType, async (exitCode) => {
				logger.info("Shutting down server...");
				await self.#hooks.invoke(YabEvents.OnExit, [server]);
				server.stop();
				setTimeout(() => {
					process.exit(exitCode);
				}, 500);
			});
		}

		onStarted(server, this.#config);
	}
}
