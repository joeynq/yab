import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function Guard() {
	return RouterHook(RouterEvent.Guard);
}
