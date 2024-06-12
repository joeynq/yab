import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { wsHandlerStore } from "../stores";

export interface SocketControllerOptions {
	deps?: Class<any>[];
}

export const SocketController = (
	topic: `/${string}`,
	{ deps = [] }: SocketControllerOptions = {},
) => {
	return useDecorators(
		(target: any) => {
			const events = wsHandlerStore.apply(target).get();
			for (const [event] of events) {
				wsHandlerStore.apply(target).updateChannel(event, topic);
			}
		},
		Injectable("SCOPED"),
		Deps(...deps),
	);
};
