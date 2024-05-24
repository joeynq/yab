import {
	type AppContext,
	AppHook,
	Configuration,
	ContextService,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	registerProviders,
} from "@vermi/core";
import { type Class, pathStartsWith, uuid } from "@vermi/utils";
import { type Server, type ServerWebSocket, type WebSocketHandler } from "bun";
import type { WsData } from "./interfaces";
import { SocketHandler } from "./services";

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

@Module({ deps: [SocketHandler] })
export class WsModule extends VermiModule<WsModuleOptions> {
	@Logger()
	private logger!: LoggerAdapter;

	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
		protected socketHandler: SocketHandler,
	) {
		super();
	}

	@AppHook("app:init")
	async onInit(_: AppContext, server: Server) {
		const { eventStores } = this.config;

		registerProviders(...eventStores);

		this.socketHandler.initRouter(eventStores);
		this.configuration.options.websocket = this.socketHandler.buildHandler(
			server,
			this.config,
		);
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
