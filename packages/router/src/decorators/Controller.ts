import {
	AutoHook,
	type HookHandler,
	HookMetadataKey,
	getMetadata,
	setMetadata,
} from "@vermi/core";
import type { SlashedPath } from "../interfaces";
import { getControllerMetadata, setControllerMetadata } from "../utils";

export const Controller = (path: SlashedPath) => {
	return (target: any) => {
		const metadata = getControllerMetadata(target);
		metadata.prefix = path;
		metadata.controller = target;

		const hookData: Record<string, HookHandler[]> =
			getMetadata(HookMetadataKey, target.prototype) || {};

		const newHooks = Object.entries(hookData).reduce(
			(acc, [key, value]) => {
				acc[key] = value.map((hook) => ({
					...hook,
					scope: hook.scope?.replace("{prefix}", path),
				}));
				return acc;
			},
			{} as Record<string, HookHandler[]>,
		);

		setMetadata(HookMetadataKey, newHooks, target.prototype);
		setControllerMetadata(target, metadata);
		AutoHook("router:init")(target);
	};
};
