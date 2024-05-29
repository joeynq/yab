import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function Before() {
	return RouterHook(RouterEvent.BeforeHandle);
}
