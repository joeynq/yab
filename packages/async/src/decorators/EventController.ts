import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { eventStore } from "../stores";

export interface SocketControllerOptions {
	deps?: Class<any>[];
}

export const EventController = (
	topic: string,
	{ deps = [] }: SocketControllerOptions = {},
) => {
	return useDecorators(
		(target: any) => {
			eventStore.apply(target).setTopic(topic);
		},
		Injectable("SCOPED"),
		Deps(...deps),
	);
};
