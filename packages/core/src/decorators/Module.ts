import { AutoHook } from "./Inject";

export const Module = () => {
	return (target: any) => {
		AutoHook("app:init")(target);
	};
};
