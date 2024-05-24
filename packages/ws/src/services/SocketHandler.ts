import {
	type ContextService,
	Injectable,
	asClass,
	asValue,
	containerRef,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { Server, ServerWebSocket, WebSocketHandler } from "bun";
import Memoirist from "memoirist";
import type { WsModuleOptions } from "../WsModule";
import { WsMessage } from "../events";
import type { WsData, _WsContext } from "../interfaces";
import { type WsHandler, wsHandlerStore } from "../stores";
import { enhanceWs } from "../utils";

@Injectable("SINGLETON")
export class SocketHandler {
	#router = new Memoirist<WsHandler>();

	constructor(protected contextService: ContextService) {}

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

	initRouter(eventStores: Class<any>[]) {
		for (const eventStore of eventStores) {
			const store = wsHandlerStore.apply(eventStore).get();

			for (const [event, handlerData] of store.entries()) {
				this.#router.add(event, handlerData.channel, handlerData);
			}
		}
	}

	buildHandler(
		server: Server,
		options?: Omit<WsModuleOptions, "path">,
	): WebSocketHandler<WsData> {
		return {
			open: this.#onOpen.bind(this),
			message: this.#onMessage.bind(this, server),
			close: this.#onClose.bind(this),
			...options,
		};
	}
}
