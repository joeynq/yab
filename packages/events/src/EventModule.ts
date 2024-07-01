import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	VermiModule,
	registerProviders,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { TypedEventEmitter } from "./interfaces";
import { EventDispatcher } from "./services";
import { eventStore } from "./stores";

declare module "@vermi/core" {
	interface _AppContext {
		eventDispatcher: EventDispatcher;
	}
}

export interface EventModuleConfig<
	T extends TypedEventEmitter = TypedEventEmitter,
> {
	emitter: T;
	subscribers: Class<any>[];
}

@Module({ deps: [EventDispatcher] })
export class EventModule extends VermiModule<EventModuleConfig> {
	@Config() public config!: EventModuleConfig;

	constructor(protected configuration: Configuration) {
		super();
	}

	@AppHook("app:init")
	init(context: AppContext) {
		registerProviders(...this.config.subscribers);
		for (const subscriber of this.config.subscribers) {
			const { className, pattern, events } = eventStore.apply(subscriber).get();
			for (const { filter, handlerId, propertyKey } of events) {
				const handler = (event: Event) => {
					const instance = context.resolve<any>(className);
					return instance[propertyKey](event);
				};
				context.store.eventDispatcher.addHandler(type, handler);
			}
		}
	}
}
