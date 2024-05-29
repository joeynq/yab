import { Hook } from "@vermi/core";
import type { RouterEvent } from "../event";

export function RouterHook(event: RouterEvent) {
	return Hook(event, { scoped: true });
}
