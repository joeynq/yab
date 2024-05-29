import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function AfterRoute() {
	return RouterHook(RouterEvent.AfterRoute);
}
