import {
	type Class,
	type Dictionary,
	type EnumValues,
	type MaybePromiseFunction,
	isNil,
} from "@vermi/utils";
import { Injectable } from "../decorators";
import type { AppContext, EventPayload, EventResult } from "../interfaces";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = (
	...args: EventPayload<EventType, Event, EventMap>
) => EventResult<EventType, Event, EventMap>;

export interface EventObject<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> {
	target?: Class<any>;
	handler: EventHandler<EventType, Event, EventMap>;
	scope?: string;
}

interface InvokeOptions {
	breakOn?:
		| "null"
		| "result"
		| "error"
		| "resultOrError"
		| (<T>(result: T) => boolean);
	scope?: string;
}

@Injectable("SINGLETON")
export class Hooks<
	EventType extends { [key: string]: string } = Dictionary<string>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction> = Record<
		string,
		MaybePromiseFunction
	>,
	Context extends AppContext = AppContext,
> {
	#hooks: Map<
		string,
		EventObject<EventType, EnumValues<EventType>, EventMap>[]
	> = new Map();

	#context?: Context;

	get debug() {
		type WithEvent = {
			event: string;
		} & EventObject<EventType, EnumValues<EventType>, EventMap>;
		const debug: WithEvent[] = [];

		this.#hooks.forEach((handlers, event) => {
			debug.push(
				...handlers.map((handler) => ({
					...handler,
					event,
				})),
			);
		});

		return debug;
	}

	#shouldBreak(result: any, breakOn: InvokeOptions["breakOn"]) {
		if (breakOn === "null" && result === null) {
			return true;
		}

		if (
			(breakOn === "result" || breakOn === "resultOrError") &&
			!isNil(result)
		) {
			return true;
		}

		if (typeof breakOn === "function" && breakOn(result)) {
			return true;
		}

		return false;
	}

	useContext(context: Context) {
		this.#context = context;
	}

	register<Event extends EnumValues<EventType>>(
		event: Event,
		eventObject: EventObject<EventType, Event, EventMap>,
	) {
		let handlers = this.#hooks.get(event);
		if (handlers) {
			handlers.push(eventObject);
		} else {
			handlers = [eventObject];
		}
		this.#hooks.set(event, handlers);
	}

	async invoke<Event extends EnumValues<EventType>>(
		event: Event,
		args: EventPayload<EventType, Event, EventMap>,
		{ breakOn = "error", scope }: InvokeOptions = {},
	): Promise<EventResult<EventType, Event, EventMap> | undefined> {
		let handlers = this.#hooks.get(event);
		if (!handlers?.length) {
			return;
		}

		if (scope) {
			handlers = handlers.filter((handler) => handler.scope === scope);
		}

		for (const event of handlers) {
			try {
				let handler = event.handler;
				if (event.target) {
					handler = handler.bind(this.#context?.resolve(event.target.name));
				}
				const result = await handler(...args);

				if (this.#shouldBreak(result, breakOn)) {
					return result as any;
				}
			} catch (error) {
				if (breakOn === "error" || breakOn === "resultOrError") {
					throw error;
				}
			}
		}
	}
}
