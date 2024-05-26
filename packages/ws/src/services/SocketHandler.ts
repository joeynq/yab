import {
	Config,
	Configuration,
	type ContextService,
	type EnhancedContainer,
	Hooks,
	Injectable,
	Logger,
	type LoggerAdapter,
	asClass,
	asValue,
} from "@vermi/core";
import { type Class, ensure } from "@vermi/utils";
import type { Server, ServerWebSocket } from "bun";
import Memoirist from "memoirist";
import type { WsModuleOptions } from "../WsModule";
import { type EventType, WsEvent, WsMessage } from "../events";
import { WsCloseCode } from "../exceptions";
import type { WsEventMap, WsEvents } from "../hooks";
import type { WsData, _WsContext } from "../interfaces";
import { type WsHandler, wsHandlerStore } from "../stores";
import { type EnhancedWebSocket, enhanceWs } from "../utils";

@Injectable()
export class SocketHandler {
	#router = new Memoirist<WsHandler>();
	#sockets = new Map<string, EnhancedWebSocket<WsData>>();
	#server!: Server;

	@Logger() private logger!: LoggerAdapter;
	@Config("WsModule") private config!: WsModuleOptions;

	get context() {
		ensure(this.contextService.context, "Context not found");
		return this.contextService.context as EnhancedContainer<_WsContext>;
	}

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected hooks: Hooks,
	) {}

	#createEvent(ws: EnhancedWebSocket<WsData>, message: Buffer) {
		const { sid, type, data, topic, event } =
			ws.data.parser.decode<any>(message);

		if (topic) {
			return new WsMessage(sid, event, topic, data);
		}

		return new WsEvent(sid, type, data);
	}

	#prepareContext(ws: EnhancedWebSocket<WsData>) {
		const sendTopic = (topic: `/${string}`, type: EventType, data: any) => {
			this.#server.publish(
				topic,
				ws.data.parser.encode(new WsEvent(ws.data.sid, type, data)),
			);
		};

		const broadcast = (type: EventType, data: any) => {
			sendTopic("/", type, data);
		};

		this.context.register({
			traceId: asValue(ws.data.sid),
			ws: asValue(ws),
			broadcast: asValue(broadcast),
			sendTopic: asValue(sendTopic),
		});
		return this.context.expose();
	}

	async #onOpen(_ws: ServerWebSocket<WsData>) {
		if (!_ws.data.sid) {
			this.logger.error("No sid provided");
			return _ws.close(WsCloseCode.InvalidData, "No sid provided");
		}
		const ws = enhanceWs(_ws);
		const context = this.#prepareContext(ws);

		ws.subscribe("/");

		this.#sockets.set(ws.data.sid, ws);

		this.hooks.invoke("ws-hook:connect", [context]);

		ws.sendEvent("connect");
		this.logger.info("Client connected with sid: {sid}", { sid: ws.data.sid });
	}

	async #onMessage(_ws: ServerWebSocket<WsData>, message: Buffer) {
		const ws = enhanceWs(_ws);
		// TODO: Run this in a separate thread
		const context = this.#prepareContext(ws);
		try {
			const hooks = context.store.hooks as Hooks<typeof WsEvents, WsEventMap>;
			const event = this.#createEvent(ws, message);

			if (event.type === "subscribe") {
				this.logger.info("Subscribing to {topic}", { topic: event.data });
				await hooks.invoke("ws-hook:subscribe", [context, event.data]);
				ws.subscribe(event.data);
				return;
			}

			if (event.type === "unsubscribe") {
				this.logger.info("Unsubscribing from {topic}", { topic: event.data });
				await hooks.invoke("ws-hook:unsubscribe", [context, event.data]);
				ws.unsubscribe(event.data);
				return;
			}

			if (!(event instanceof WsMessage)) {
				throw new Error("Invalid message type");
			}

			const handler = this.#router.find(event.event, event.topic);

			if (!handler) {
				throw new Error("Handler not found");
			}

			await hooks.invoke("ws-hook:guard", [context]);

			const {
				params,
				store: { eventStore, method },
			} = handler;

			context.register("params", asValue(params));

			const instance = context.build(asClass(eventStore));
			const methodHandler = instance[method];

			await methodHandler.call(instance, context);
		} catch (error) {
			this.logger.error(error, "Error handling message");
			return ws.sendEvent("error", error as Error);
		}
	}

	async #onClose(ws: ServerWebSocket<WsData>, code: number, reason: string) {
		const context = this.#prepareContext(enhanceWs(ws));
		ws.unsubscribe("/");
		this.#sockets.delete(ws.data.sid);
		this.hooks.invoke("ws-hook:disconnect", [context, code, reason]);
	}

	initRouter(eventStores: Class<any>[]) {
		for (const eventStore of eventStores) {
			const store = wsHandlerStore.apply(eventStore).get();

			for (const [event, handlerData] of store.entries()) {
				this.#router.add(event, handlerData.topic, handlerData);
			}
		}
	}

	buildHandler(server: Server): void {
		this.#server = server;
		this.configuration.options.websocket = {
			open: this.#onOpen.bind(this),
			message: this.#onMessage.bind(this),
			close: this.#onClose.bind(this),
			...this.config.server,
		};
	}
}
