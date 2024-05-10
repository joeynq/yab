import {
	type AnyClass,
	type Dictionary,
	type EnumValues,
	type MaybePromiseFunction,
	isNil,
} from "@vermi/utils";
import type { AppContext, EventPayload, EventResult } from "../interfaces";
import { HookMetadataKey } from "../symbols";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = (
	...args: EventPayload<EventType, Event, EventMap>
) => EventResult<EventType, Event, EventMap>;

interface EventObject<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> {
	target?: AnyClass;
	handler: EventHandler<EventType, Event, EventMap>;
	scope?: string;
}

interface InvokeOptions {
	breakOn?: "null" | "result" | "error" | (<T>(result: T) => boolean);
	scope?: string;
}

export type HookHandler = {
	target?: AnyClass;
	method: string;
	scope?: string;
};

export class Hooks<
	EventType extends { [key: string]: string } = Dictionary<string>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction> = Record<
		string,
		MaybePromiseFunction
	>,
	Context extends AppContext = AppContext,
> {
	#hooks = new Map<
		string,
		Array<EventObject<EventType, EnumValues<EventType>, EventMap>>
	>();

	#context?: Context;

	get debug() {
		return this.#hooks;
	}

	#shouldBreak(result: any, breakOn: InvokeOptions["breakOn"]) {
		if (breakOn === "null" && result === null) {
			return true;
		}

		if (breakOn === "result" && !isNil(result)) {
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

	getMetadata(instance: any) {
		return Reflect.getMetadata(HookMetadataKey, instance) as Dictionary<
			string[]
		>;
	}

	registerFromMetadata(instance: any) {
		const hooks = Reflect.getMetadata(HookMetadataKey, instance) as Dictionary<
			HookHandler[]
		>;
		if (!hooks) {
			return;
		}
		for (const [event, handlers] of Object.entries(hooks)) {
			for (const { target, method, scope } of handlers) {
				const currentInstance = target
					? this.#context?.resolve(target.name)
					: instance;

				const handler = currentInstance?.[method].bind(currentInstance);

				handler &&
					this.register(event as EnumValues<EventType>, {
						target,
						handler,
						scope,
					});
			}
		}
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

		for (const { handler: rawHandler, target } of handlers) {
			try {
				let handler = rawHandler as MaybePromiseFunction;
				if (target && this.#context?.resolve(target)) {
					handler = handler.bind(this.#context.resolve(target));
				}
				const result = await handler(...args);

				if (this.#shouldBreak(result, breakOn)) {
					return result as any;
				}
			} catch (error) {
				if (breakOn === "error") {
					throw error;
				}
			}
		}
	}
}
