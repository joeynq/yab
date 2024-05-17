import {
	type AppContext,
	AppHook,
	type Configuration,
	ContextService,
	VermiModule,
	asClass,
	asValue,
	containerRef,
} from "@vermi/core";
import { type Class, uuid } from "@vermi/utils";
import { EventEmitter } from "tseep";
import type { EventContext } from "./interfaces/EventContext";
import { handlerStore } from "./stores/handlerStore";

declare module "@vermi/core" {
	interface EventContext {
		emitter: EventEmitter;
		contextService: ContextService;
	}
}

export type EventModuleConfig = {
	eventStores: Class<any>[];
};

export class EventModule extends VermiModule<EventModuleConfig> {
	#emitter = new EventEmitter();
	#contextService: ContextService;
	constructor(
		protected configuration: Configuration,
		protected contextService: ContextService,
	) {
		super();
		this.#contextService = contextService;
	}

	#registerService(context: EventContext) {
		context.register({
			emitter: asValue(this.#emitter),
		});
	}

	#initEventHanlder(context: AppContext) {
		const container = containerRef();
		const registering: Record<string, ReturnType<typeof asClass>> = {};
		const { eventStores } = this.config;

		for (const store of eventStores) {
			const handlerMetadata = handlerStore.apply(store).get();
			const resolver = asClass(store).singleton();
			const instance = context.build(resolver);
			registering[store.name] = resolver;

			for (const { eventKey, methodName } of handlerMetadata) {
				const handler = instance[methodName].bind(instance);
				this.#emitter.on(eventKey, (...args: any[]) => {
					const eventId = uuid();
					const dateTime = new Date().getTime();

					this.#contextService.runInContext(
						container.createEnhancedScope(),
						async (stored) => {
							stored.register({
								eventId: asValue(eventId),
								time: asValue(dateTime),
								payload: asValue(args),
							});
							handler(...args);
						},
					);
				});
			}

			context.register(registering);
		}
	}

	@AppHook("app:init")
	init(context: EventContext) {
		this.#registerService(context);
		this.#initEventHanlder(context);
	}
}
