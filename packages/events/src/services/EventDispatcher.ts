import { Config, Injectable } from "@vermi/core";
import type { Dictionary, MaybePromiseFunction } from "@vermi/utils";
import type { EventModuleConfig } from "../EventModule";
import type { EventHandler, EventType } from "../interfaces";

@Injectable("SCOPED")
export class EventDispatcher {
	@Config("EventModule") private config!: EventModuleConfig;

	get emitter() {
		return this.config.emitter;
	}

	addHandler<Event extends string>(
		event: Event,
		handler: EventHandler<
			Dictionary<string>,
			Record<string, MaybePromiseFunction>
		>,
	): void {
		this.emitter.on(event, handler);
	}

	removeHandler<Event extends string>(
		event: Event,
		handler: EventHandler<
			Dictionary<string>,
			Record<string, MaybePromiseFunction>
		>,
	): void {
		this.emitter.off(event, handler);
	}

	dispatch<Payload>(event: EventType<Payload>): void {
		this.emitter.emit(event.type, event);
	}
}
