import {
	type AppContext,
	AppHook,
	Configuration,
	ContextService,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	asClass,
	asValue,
	containerRef,
} from "@vermi/core";
import { type Class, pathStartsWith, uuid } from "@vermi/utils";
import { type Server, type ServerWebSocket, type WebSocketHandler } from "bun";
import Memoirist from "memoirist";
import { WsMessage } from "./events";
import type { WsData, _WsContext } from "./interfaces";
import { type WsHandler, wsHandlerStore } from "./stores";
import { enhanceWs } from "./utils";

declare module "@vermi/core" {
	interface AppOptions {
		websocket?: WebSocketHandler<any>;
	}
	interface _AppContext {
		ws: ServerWebSocket<any>;
	}

	interface _RequestContext {
		userId?: string;
	}
}

export interface WsModuleOptions {
	path: string;
	maxPayloadLength?: number;
	backpressureLimit?: number;
	closeOnBackpressureLimit?: boolean;
	idleTimeout?: number;
	publishToSelf?: boolean;
	sendPings?: boolean;
	eventStores: Class<any>[];
}

@Module()
export class WsModule extends VermiModule<WsModuleOptions> {
	#router = new Memoirist<WsHandler>();

	constructor(
		protected configuration: Configuration,
		protected logger: LoggerAdapter,
		protected contextService: ContextService,
	) {
		super();
	}

	async #onOpen(ws: ServerWebSocket<WsData>) {
		this.contextService.runInContext(
			containerRef().createEnhancedScope(),
			async (container) => {
				container.register({
					ws: asValue(enhanceWs(ws)),
					data: asValue(ws.data),
				});
				await await container.cradle.hooks.invoke("ws-hook:connect", [
					container.expose(),
				]);

				ws.inform("opened");
			},
		);
	}

	async #onMessage(
		server: Server,
		ws: ServerWebSocket<WsData>,
		message: string | Buffer,
	) {
		return this.contextService.runInContext<_WsContext, any>(
			containerRef().createEnhancedScope<_WsContext>(),
			async (container) => {
				try {
					container.register({
						traceId: asValue(ws.data.sid),
						ws: asValue(enhanceWs(ws)),
						data: asValue(ws.data),
						send: asValue((message) => ws.send(message)),
						sendToChannel: {
							lifetime: "SCOPED",
							resolve(context) {
								return (message: Uint8Array) => {
									const event = (context.cradle as _WsContext).event;
									if (!event?.channel) {
										return ws.sendError(
											new Error("You must provide a channel"),
										);
									}
									server.publish(event?.channel, message);
								};
							},
						},
					});

					const hooks = container.cradle.hooks;

					await hooks.invoke("ws-hook:init", [container.expose()]);

					await hooks.invoke("ws-hook:guard", [container.expose()]);

					const { event, channel } = WsMessage.unpack(ws.data.sid, message);

					const handler = this.#router.find(event, channel);

					if (!handler) {
						throw new Error("Handler not found");
					}

					ws.subscribe(channel);

					const {
						params,
						store: { eventStore, method },
					} = handler;

					container.register({
						ws: asValue(enhanceWs(ws)),
						params: asValue(params),
					});

					const instance = container.build(asClass(eventStore));
					const methodHandler = instance[method];

					await methodHandler.call(instance, container.expose());

					// ws.send(new WsMessage(ws.data.sid, channel, event, {}).pack());
				} catch (error) {
					return ws.sendError(error as Error);
				}
			},
		);
	}

	async #onClose(ws: ServerWebSocket<WsData>, code: number, reason: string) {
		this.contextService.runInContext(
			containerRef().createEnhancedScope(),
			async (container) => {
				container.register({
					ws: asValue(enhanceWs(ws)),
					data: asValue(ws.data),
				});
				await container.cradle.hooks.invoke("ws-hook:disconnect", [
					container.expose(),
					code,
					reason,
				]);
				ws.inform("closed");
			},
		);
	}

	@AppHook("app:init")
	async onInit(context: AppContext, server: Server) {
		const { eventStores } = this.config;

		context.registerServices(...eventStores);

		for (const eventStore of eventStores) {
			const store = wsHandlerStore.apply(eventStore).get();

			for (const [event, handlerData] of store.entries()) {
				this.#router.add(event, handlerData.channel, handlerData);
			}
		}

		const websocketHandler: WebSocketHandler<WsData> = {
			message: this.#onMessage.bind(this, server),
			open: this.#onOpen.bind(this),
			close: this.#onClose.bind(this),
			...this.config,
		};
		this.configuration.options.websocket = websocketHandler;
	}

	@AppHook("app:request")
	async onRequest(context: RequestContext, server: Server) {
		const { request } = context.store;

		if (pathStartsWith(request.url, this.config.path)) {
			await context.store.hooks.invoke("ws-hook:guard", [context]);
			server.upgrade<WsData>(request, {
				data: {
					get userId() {
						return context.resolve<string>("userId");
					},
					sid: uuid(),
				},
			});
			return {};
		}
	}
}
