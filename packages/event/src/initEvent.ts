import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { EventModule, type EventModuleConfig } from "./EventModule";

export const initEvent = (
	eventStores?: Class<any>[],
): UseModule<Class<EventModule>, EventModuleConfig> => ({
	module: EventModule,
	args: { eventStores: eventStores || [] },
});
