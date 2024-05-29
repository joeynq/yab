import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function After() {
	return RouterHook(RouterEvent.AfterHandle);
}
