import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function RouteInit() {
	return RouterHook(RouterEvent.Init);
}
