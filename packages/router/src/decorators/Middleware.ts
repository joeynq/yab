import { AutoHook } from "@yab/core";

export const Middleware = () => {
	return (target: any) => {
		AutoHook("router:init")(target);
	};
};
