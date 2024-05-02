import {
	AutoHook,
	type HookHandler,
	HookMetadataKey,
	getMetadata,
	setMetadata,
} from "@yab/core";
import type { SlashedPath } from "../interfaces";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Controller = (path: SlashedPath) => {
	return (target: any) => {
		const metadata = getControllerMetadata(target);
		metadata.prefix = path;
		metadata.controller = target;

		const hookData: { [x: string]: HookHandler[] } =
			getMetadata(HookMetadataKey, target.prototype) || {};
		const newHooks: { [x: string]: HookHandler[] } = {};
		for (const [key, value] of Object.entries(hookData || {})) {
			const eventKey = key.replace("{prefix}", path);
			newHooks[eventKey] = value;
		}

		setMetadata(HookMetadataKey, newHooks, target.prototype);
		setControllerMetadata(target, metadata);
		AutoHook("router:init")(target);
	};
};
