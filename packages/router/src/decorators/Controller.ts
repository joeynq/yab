import { AutoHook } from "@yab/core";
import type { SlashedPath } from "../interfaces";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Controller = (path: SlashedPath) => {
	return (target: any) => {
		const metadata = getControllerMetadata(target);
		metadata.prefix = path;
		metadata.controller = target;
		setControllerMetadata(target, metadata);
		AutoHook("router:init")(target);
	};
};
