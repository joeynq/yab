import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function BeforeRoute() {
	return RouterHook(RouterEvent.BeforeRoute);
}
