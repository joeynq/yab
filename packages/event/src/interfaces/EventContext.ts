import type { AppContext } from "@vermi/core";
import type { EventEmitter } from "tseep";

export interface EventContext extends AppContext {
	emitter: EventEmitter;
}
