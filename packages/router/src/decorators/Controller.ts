import { InjectOn, Injectable, hookStore, useDecorators } from "@vermi/core";
import type { SlashedPath } from "../interfaces";
import { routeStore } from "../stores";

export const Controller = (prefix: SlashedPath) => {
	return useDecorators(
		(target: any) => {
			routeStore.apply(target).updatePathPrefix({ prefix });
		},
		(target: any) => {
			hookStore.apply(target).updateScope({ prefix });
		},
		InjectOn("router:init"),
		Injectable("SINGLETON"),
	);
};
