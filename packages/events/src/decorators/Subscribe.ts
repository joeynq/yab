import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { eventStore } from "../stores";

export interface SubscribeOptions {
	deps?: Class<any>[];
}

export function Subscribe(
	pattern: string | RegExp,
	{ deps = [] }: SubscribeOptions = {},
) {
	return useDecorators(
		(target: any, key: string | symbol) => {
			eventStore.apply(target.constructor).setPattern(pattern);
		},
		Injectable("SINGLETON"),
		Deps(...deps),
	);
}
