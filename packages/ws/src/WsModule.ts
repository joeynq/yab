import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	ContextService,
	Hooks,
	Module,
	type RequestContext,
	type VermiModule,
	asClass,
	hookStore,
	registerHooks,
	registerProviders,
} from "@vermi/core";
import {
	type Class,
	type Dictionary,
	pathStartsWith,
	uuid,
} from "@vermi/utils";
import { type Server, type WebSocketHandler } from "bun";
import type { WsEventMap, WsEvents } from "./hooks";
import type { WsData } from "./interfaces";
import { JsonParser } from "./parser/JsonParser";
import type { Parser } from "./parser/Parser";
import { SocketHandler } from "./services";
import { wsHandlerStore } from "./stores";

declare module "@vermi/core" {
	interface AppOptions {
		websocket?: WebSocketHandler<any>;
	}

	interface _AppContext {
		parser: Parser;
	}
}

export interface WsModuleOptions {
	path: string;
	eventStores: Class<any>[];
	parser?: Class<Parser>;
	server?: {
		maxPayloadLength?: number;
		backpressureLimit?: number;
		closeOnBackpressureLimit?: boolean;
		idleTimeout?: number;
		publishToSelf?: boolean;
		sendPings?: boolean;
	};
}

@Module({ deps: [SocketHandler] })
export class WsModule implements VermiModule<WsModuleOptions> {
	@Config() public config!: WsModuleOptions;

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected socketHandler: SocketHandler,
	) {}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		const { eventStores, parser = JsonParser } = this.config;

		registerProviders(...eventStores);

		for (const store of eventStores) {
			const handlers = wsHandlerStore.apply(store).get();
			for (const [_, { handlerId }] of handlers) {
				hookStore.apply(store).scoped(handlerId);
			}
		}

		registerHooks(context, ...eventStores);
		context.register("parser", asClass(parser).singleton());

		this.socketHandler.initRouter(eventStores);
		this.socketHandler.buildHandler();
	}

	@AppHook("app:started")
	async onStarted(_: AppContext, server: Server) {
		this.socketHandler.setServer(server);
	}

	@AppHook("app:request")
	async onRequest(context: RequestContext, server: Server) {
		const { request } = context.store;

		if (pathStartsWith(request.url, this.config.path)) {
			const hooks = context.store.hooks as Hooks<typeof WsEvents, WsEventMap>;

			const customData: Dictionary<any> = {};

			await hooks.invoke("ws-hook:handshake", [context, customData]);

			server.upgrade<WsData>(request, {
				data: {
					...customData,
					sid: uuid(),
				},
			});
			return {};
		}
	}
}
