import { type Class, deepMerge, ensure, uuid } from "@vermi/utils";
import {
	type BuildResolver,
	InjectionMode,
	Lifetime,
	asClass,
	asValue,
	createContainer,
} from "awilix";
import type { Server } from "bun";
import { type AppEventMap, AppEvents } from "./events";
import { HttpException } from "./exceptions";
import type {
	AbstractLogger,
	AppContext,
	AppOptions,
	EnhancedContainer,
	LoggerAdapter,
	UseModule,
	_AppContext,
	_RequestContext,
} from "./interfaces";
import {
	Configuration,
	ConsoleLogger,
	ContextService,
	Hooks,
} from "./services";
import { hookStore } from "./store";
import { enhance } from "./utils";

export class Vermi {
	#logger: LoggerAdapter;
	#context = new ContextService();
	#container = enhance(
		createContainer<_AppContext>({
			injectionMode: InjectionMode.CLASSIC,
			strict: true,
		}),
	);
	#hooks = new Hooks<typeof AppEvents, AppEventMap>();

	#customContext?: (ctx: _RequestContext) => Record<string, unknown>;

	#options: AppOptions;

	get hooks() {
		const hooks =
			this.#context.context?.resolve<Hooks<typeof AppEvents, AppEventMap>>(
				"hooks",
			);
		ensure(hooks);
		return hooks;
	}

	constructor(options?: Partial<AppOptions>) {
		this.#logger = new ConsoleLogger(options?.log);

		this.#options = {
			modules: new Map(),
			...options,
		};
	}

	#registerServices() {
		this.#container.register({
			appConfig: asValue(this.#options),
			_logger: asValue(this.#logger),
			env: asValue(this.#options?.env || {}),
			app: asValue(this),
			logger: {
				resolve: (c) => {
					const _logger = c.resolve<LoggerAdapter>("_logger");

					if (c.hasRegistration("requestId")) {
						return _logger.useContext({
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
			configuration: asClass(Configuration),
			hooks: asValue(this.#hooks),
		});
	}

	#initModules() {
		const registering: Record<string, BuildResolver<any>> = {};
		const modules: any[] = [];
		for (const [name, { module }] of this.#options.modules) {
			const resolver = asClass(module);
			modules.push(this.#container.build(resolver));

			registering[name] = resolver;
		}

		this.#container.register(registering);

		for (const module of modules) {
			const moduleHooks = hookStore.apply(module.constructor).get();
			for (const [event, handlers] of moduleHooks.entries()) {
				for (const { target, handler, scope } of handlers) {
					this.#hooks.register(event as any, {
						target:
							target?.name === module.constructor.name ? undefined : target,
						handler: handler.bind(module),
						scope,
					});
				}
			}
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
							requestId: asValue(request.headers.get("x-request-id") ?? uuid()),
							request: asValue(request),
							serverUrl: asValue(server.url.toJSON()),
							userIp: asValue(server.requestIP(request) || undefined),
							userAgent: asValue(
								request.headers.get("user-agent") ?? undefined,
							),
						});

						const hooks = stored.cradle.hooks as Hooks<
							typeof AppEvents,
							AppEventMap
						>;

						hooks.useContext(stored.expose());

						for (const [key, value] of Object.entries(
							this.#customContext?.(stored.cradle) || {},
						)) {
							stored.registerValue(key, value);
						}

						await hooks.invoke(AppEvents.OnEnterContext, [stored.expose()]);

						const result = await hooks.invoke(
							AppEvents.OnRequest,
							[stored.expose()],
							{
								breakOn: "resultOrError",
							},
						);

						const url = new URL(request.url).pathname;

						const defaultResponse =
							url === "/"
								? new Response("OK", { status: 200 })
								: new Response("Not Found", { status: 404 });

						const response = result || defaultResponse;

						await hooks.invoke(AppEvents.OnResponse, [
							stored.expose(),
							response,
						]);
						resolve(response);
					} catch (error) {
						if (error instanceof HttpException) {
							return resolve(error.toResponse());
						}
						resolve(
							new HttpException(
								500,
								(error as Error).message,
								error as Error,
							).toResponse(),
						);
					} finally {
						await stored.cradle.hooks.invoke(AppEvents.OnExitContext, [
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

	logger<
		Logger extends AbstractLogger,
		Adapter extends Class<LoggerAdapter<Logger>>,
	>(logger: Adapter, options?: ConstructorParameters<Adapter>[0]) {
		this.#logger = new logger(options);
		return this;
	}

	use<M extends Class<any>, Config>({
		module,
		args,
	}: UseModule<M, Config>): this {
		const current = this.#options.modules.get(module.name);
		this.#options.modules.set(module.name, {
			module,
			config: deepMerge(current?.config, args),
		});
		return this;
	}

	async start(onStarted: (context: AppContext, server: Server) => void) {
		this.#context.runInContext(this.#container, async (container) => {
			this.#registerServices();
			this.#initModules();

			const { hooks } = container.cradle;

			hooks.useContext(container.expose());

			await hooks.invoke(AppEvents.OnInit, [container.expose()]);

			const { configuration, logger } = container.cradle;

			// console.table(this.#hooks.debug);

			const server = Bun.serve({
				...configuration.bunOptions,
				fetch: this.#runInRequestContext.bind(this, container),
			});

			await hooks.invoke(AppEvents.OnStarted, [container.expose(), server]);

			process.on("SIGINT", async () => {
				logger.info("Shutting down server...");
				await hooks.invoke(AppEvents.OnExit, [container.expose(), server]);

				this.#container.dispose();

				server.stop();
				setTimeout(() => {
					process.exit();
				}, 500);
			});

			onStarted(container.expose(), server);
		});
	}
}
