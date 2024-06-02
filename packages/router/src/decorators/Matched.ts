import { RouterEvent } from "../event";
import { RouterHook } from "./RouterHook";

export function Matched() {
	return RouterHook(RouterEvent.Match);
}
