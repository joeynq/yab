import { type AnyClass, type AnyFunction, deepMerge, uuid } from "@yab/utils";
import { InjectionMode, Lifetime, asValue, createContainer } from "awilix";
import type { Server } from "bun";
import { type YabEventMap, YabEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	AppContext,
	EnhancedContainer,
	LoggerAdapter,
	Module,
	ModuleConfig,
	YabOptions,
	_AppContext,
	_RequestContext,
} from "./interfaces";
import {
	Configuration,
	ConsoleLogger,
	ContextService,
	Hooks,
	containerRef,
} from "./services";
import { HookMetadataKey } from "./symbols";
import { enhance } from "./utils";

export interface YabUse<M extends AnyClass<Module>> {
	module: M;
	args: ConstructorParameters<M>;
}

export class Yab {
	#config: Configuration;
	#hooks = new Hooks<typeof YabEvents, YabEventMap>();
	#context = new ContextService();
	#container = enhance(
		createContainer<_AppContext>({
			injectionMode: InjectionMode.CLASSIC,
			strict: true,
		}),
	);

	#customContext?: (ctx: _RequestContext) => Record<string, unknown>;

	get logger() {
		return containerRef<_AppContext>().resolveValue<LoggerAdapter>("logger");
	}

	constructor(options?: Partial<YabOptions>) {
		this.#config = new Configuration({
			...options,
			modules: options?.modules || [],
		});
	}

	#registerServices() {
		this.#container.register({
			_logger: asValue(new ConsoleLogger("info")),
			env: asValue(this.#config.options.env || {}),
			app: asValue(this),
			logger: {
				resolve: (c) => {
					const _logger = c.resolve<LoggerAdapter>("_logger");

					if (c.hasRegistration("requestId")) {
						return _logger.createChild({
							requestId: c.resolve("requestId"),
							serverUrl: c.resolve("serverUrl"),
							userIp: c.resolve("userIp"),
							userAgent: c.resolve("userAgent"),
						});
					}
					return _logger;
				},
				lifetime: Lifetime.SCOPED,
			},
			Configuration: asValue(this.#config),
			Hooks: asValue(this.#hooks),
		});
	}

	#registerHooksFromModule(instance: Module) {
		this.#hooks.registerFromMetadata(instance);
	}

	#initModules() {
		const moduleConfigs = this.#config.options.modules;
		for (const { moduleInstance } of moduleConfigs) {
			this.#registerHooksFromModule(moduleInstance);
		}
	}

	#runInRequestContext(
		container: EnhancedContainer<_AppContext>,
		request: Request,
		server: Server,
	) {
		return new Promise<Response>((resolve) => {
			this.#context.runInContext<_RequestContext, void>(
				container.createEnhancedScope(),
				async (stored: EnhancedContainer<_RequestContext>) => {
					try {
						stored.register({
							requestId: asValue(request.headers.get("x-request-id") || uuid()),
							request: asValue(request),
							serverUrl: asValue(server.url.toJSON()),
							userIp: asValue(server.requestIP(request) || undefined),
							userAgent: asValue(
								request.headers.get("user-agent") || undefined,
							),
						});

						for (const [key, value] of Object.entries(
							this.#customContext?.(stored.cradle) || {},
						)) {
							stored.registerValue(key, value);
						}

						await this.#hooks.invoke(YabEvents.OnEnterContext, [
							stored.expose(),
						]);

						const result = await this.#hooks.invoke(
							YabEvents.OnRequest,
							[stored.expose()],
							{
								breakOnResult: true,
							},
						);

						const response = result || new Response("OK", { status: 200 });

						await this.#hooks.invoke(YabEvents.OnResponse, [
							stored.expose(),
							response,
						]);
						resolve(response);
					} catch (error) {
						if (error instanceof HttpException) {
							return resolve(error.toResponse());
						}
						resolve(
							new HttpException(500, (error as Error).message).toResponse(),
						);
					} finally {
						await this.#hooks.invoke(YabEvents.OnExitContext, [
							stored.expose(),
						]);
					}
				},
			);
		});
	}

	useContext<T extends Record<string, unknown>>(
		getContext: (ctx: _RequestContext) => T,
	) {
		this.#customContext = getContext;
		return this;
	}

	use<M extends AnyClass<Module>>({ module, args }: YabUse<M>): this {
		const config: ModuleConfig = {
			moduleInstance: new module(...args),
			hooks: {},
		};

		const hookMetadata = Reflect.getMetadata(
			HookMetadataKey,
			module.prototype,
		) as Record<string, (string | symbol)[]> | undefined;

		if (hookMetadata) {
			for (const [event, methods] of Object.entries(hookMetadata)) {
				for (const method of methods) {
					const instance = config.moduleInstance;
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

		this.#config.setModuleConfig(config);

		return this;
	}

	async start(onStarted: (context: AppContext, server: Server) => void) {
		this.#context.runInContext(this.#container, async (container) => {
			this.#registerServices();
			this.#initModules();

			await this.#hooks.invoke(YabEvents.OnInit, [container.expose()]);

			const server = Bun.serve({
				...this.#config.bunOptions,
				fetch: this.#runInRequestContext.bind(this, container),
			});
			await this.#hooks.invoke(YabEvents.OnStarted, [
				container.expose(),
				server,
			]);

			for (const eventType of ["SIGTERM"]) {
				process.on(eventType, async (exitCode) => {
					this.logger.info("Shutting down server...");
					await this.#hooks.invoke(YabEvents.OnExit, [
						container.expose(),
						server,
					]);
					server.stop();
					setTimeout(() => {
						process.exit(exitCode);
					}, 500);
				});
			}

			onStarted(container.expose(), server);
		});
	}
}
