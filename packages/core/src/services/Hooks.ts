import {
	type AnyClass,
	type Dictionary,
	type EnumValues,
	type MaybePromiseFunction,
	isUndefined,
} from "@yab/utils";
import type { AppContext, EventPayload, EventResult } from "../interfaces";
import { HookMetadataKey } from "../symbols";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = (
	...args: EventPayload<EventType, Event, EventMap>
) => EventResult<EventType, Event, EventMap>;

interface InvokeOptions {
	breakOnResult?: boolean;
	breakOnNull?: boolean;
	breakOnError?: boolean;
}

export type HookHandler = {
	target?: AnyClass;
	method: string;
	scoped?: "request";
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
		Array<EventHandler<EventType, EnumValues<EventType>, EventMap>>
	>();

	#context?: Context;

	get debug() {
		return this.#hooks;
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
		if (hooks) {
			for (const [event, handlers] of Object.entries(hooks)) {
				for (const { target, method } of handlers) {
					const currentInstance = !isUndefined(target)
						? this.#context?.resolve(target.name)
						: instance;

					const handler = currentInstance?.[method].bind(currentInstance);

					handler && this.register(event as EnumValues<EventType>, handler);
				}
			}
		}
	}

	register<Event extends EnumValues<EventType>>(
		event: Event,
		callback: EventHandler<EventType, Event, EventMap>,
	) {
		let handlers = this.#hooks.get(event);
		if (handlers) {
			handlers.push(callback);
		} else {
			handlers = [callback];
		}
		this.#hooks.set(event, handlers);
	}

	async invoke<Event extends EnumValues<EventType>>(
		event: Event,
		args: EventPayload<EventType, Event, EventMap>,
		{
			breakOnResult = false,
			breakOnNull = false,
			breakOnError = true,
		}: InvokeOptions = {},
	): Promise<EventResult<EventType, Event, EventMap> | undefined> {
		const handlers = this.#hooks.get(event);
		if (handlers) {
			for (const handler of handlers) {
				try {
					const result = await handler(...args);
					if (breakOnNull && result === null) {
						break;
					}
					if (breakOnResult && !isUndefined(result)) {
						return result;
					}
				} catch (error) {
					if (breakOnError) {
						throw error;
					}
				}
			}
		}
	}
}
