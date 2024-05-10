import { AutoHook } from "@vermi/core";

export const Middleware = () => {
	return (target: any) => {
		AutoHook("router:init", true)(target);
	};
};
