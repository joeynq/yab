import {
	type AppContext,
	AppHook,
	Configuration,
	ContextService,
	Hooks,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	type _AppContext,
	asValue,
	containerRef,
} from "@vermi/core";
import { pathStartsWith, uuid } from "@vermi/utils";
import { type Server, type ServerWebSocket, type WebSocketHandler } from "bun";
import Memoirist from "memoirist";
import { WsConnection } from "./events/WsConnection";
import { WsError } from "./events/WsError";
import type { EventType } from "./events/WsEvent";
import type { WsHookEventMap, WsHookEvents } from "./events/WsHook";
import { WsMessage } from "./events/WsMessage";

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

declare module "bun" {
	interface ServerWebSocket<T> {
		sendError(error: Error): void;
		sendMessage(message: Uint8Array): void;
		inform: (type: EventType) => void;
	}
}

const enhanceWs = (ws: ServerWebSocket<any>) => {
	ws.sendError = (error: Error) => {
		ws.send(new WsError(ws.data.sid, error).pack());
	};
	ws.sendMessage = (message: Uint8Array) => {
		ws.send(new WsMessage(ws.data.sid, "/", "message", message).pack());
	};
	ws.inform = (type: EventType) => {
		ws.send(new WsConnection(ws.data.sid, type).pack());
	};
	return ws;
};

export interface WsData {
	userId?: string;
	sid: string;
}

interface _WsContext extends _AppContext {
	ws: ServerWebSocket<WsData>;
	data: WsData;
	event?: WsMessage<any>;
	send: (message: Uint8Array) => void;
	broadcast: (message: Uint8Array) => void;
}

export interface WsModuleOptions {
	path: string;
	maxPayloadLength?: number;
	backpressureLimit?: number;
	closeOnBackpressureLimit?: boolean;
	idleTimeout?: number;
	publishToSelf?: boolean;
	sendPings?: boolean;
}

@Module()
export class WsModule extends VermiModule<WsModuleOptions> {
	#router = new Memoirist();

	constructor(
		protected configuration: Configuration,
		protected logger: LoggerAdapter,
		protected context: ContextService,
	) {
		super();
	}

	@AppHook("app:request")
	async onRequest(context: RequestContext, server: Server) {
		const { request } = context.store;

		if (pathStartsWith(request.url, this.config.path)) {
			await context.store.hooks.invoke("ws-hook:guard", [context]);
			return server.upgrade<WsData>(request, {
				data: {
					userId: context.store.userId,
					sid: uuid(),
				},
			});
		}
	}

	@AppHook("app:init")
	async onInit(context: AppContext, server: Server) {
		const hooks = context.store.hooks as Hooks<
			typeof WsHookEvents,
			WsHookEventMap
		>;

		const websocketHandler: WebSocketHandler<WsData> = {
			message: async (ws, message) => {
				this.context.runInContext<_WsContext, any>(
					containerRef().createEnhancedScope<_WsContext>(),
					async (container) => {
						container.register({
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

						await hooks.invoke("ws-hook:guard", [container.expose()]);

						const { event, channel } = WsMessage.unpack(
							ws.data.sid,
							message as Buffer,
						);

						const handler = this.#router.find(event, channel);

						if (!handler) {
							return ws.sendError(new Error("Handler not found"));
						}

						ws.subscribe(channel);
						container.register("ws", asValue(enhanceWs(ws)));

						// await handler(container.expose());

						ws.send(new WsMessage(ws.data.sid, channel, event, {}).pack());
					},
				);
			},
			open: async (ws) => {
				this.context.runInContext(
					containerRef().createEnhancedScope(),
					async (container) => {
						container.register({
							ws: asValue(ws),
							data: asValue(ws.data),
						});
						await hooks.invoke("ws-hook:connect", [container.expose()]);

						ws.inform("opened");
					},
				);
			},
			close: async (ws, code, reason) => {
				this.context.runInContext(
					containerRef().createEnhancedScope(),
					async (container) => {
						container.register("ws", asValue(ws));
						await hooks.invoke("ws-hook:disconnect", [context, code, reason]);
						ws.inform("closed");
					},
				);
			},
			...this.config,
		};
		this.configuration.options.websocket = websocketHandler;
	}
}
