import { InjectOn, Injectable, useDecorators } from "@vermi/core";
import { wsHandlerStore } from "../stores/wsHandlerStore";

export const SocketController = (channel: `/${string}` = "/") => {
	return useDecorators(
		(target: any) => {
			const events = wsHandlerStore.apply(target).get();
			for (const [event] of events) {
				wsHandlerStore.apply(target).updateChannel(event, channel);
			}
		},
		Injectable("SCOPED"),
		InjectOn("ws-hook:init"),
	);
};
