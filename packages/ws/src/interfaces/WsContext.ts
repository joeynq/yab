import type { ExposedContext, _RequestContext } from "@vermi/core";
import type { EventType, WsEvent } from "../events";
import type { EnhancedWebSocket } from "../utils";

type EventExtraType<Type extends Record<string, any>> =
	| keyof Type
	| Exclude<EventType, "error">;

export interface _WsContext<
	EventMap extends Record<string, any> = Record<string, any>,
	Type extends EventExtraType<EventMap> = EventExtraType<EventMap>,
> extends _RequestContext {
	ws: EnhancedWebSocket<any>;
	event: WsEvent<any>;

	broadcast(type: "error", data: Error): void;
	broadcast<Data>(type: Type, data: Data): void;

	sendTopic(topic: string, type: "error", data: Error): void;
	sendTopic<Data>(topic: string, type: Type, data: Data): void;
}

export type WsContext<
	EventMap extends Record<string, any> = Record<string, any>,
	Type extends EventExtraType<EventMap> = EventExtraType<EventMap>,
> = ExposedContext<_WsContext<EventMap, Type>>;
