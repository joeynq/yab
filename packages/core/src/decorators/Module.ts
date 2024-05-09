import { AutoHook } from "./AutoHook";

export const Module = () => {
	return (target: any) => {
		AutoHook("app:init")(target);
	};
};
