import { Deps, Injectable, hookStore, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { SlashedPath } from "../interfaces";
import { routeStore } from "../stores";

export interface ControllerOptions {
	deps?: Class<any>[];
}

export const Controller = (
	prefix: SlashedPath,
	{ deps = [] }: ControllerOptions = {},
) => {
	return useDecorators(
		(target: any) => {
			routeStore.apply(target).updatePathPrefix({ prefix });
		},
		(target: any) => {
			hookStore.apply(target).updateScope({ prefix });
		},
		Injectable("SINGLETON"),
		Deps(...deps),
	);
};
