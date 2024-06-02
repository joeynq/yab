import type { TSchema } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { WsValidateMiddleware } from "../middlewares";
import { wsHandlerStore } from "../stores";
import { Use } from "./Use";

export const OnData = (event: string, schema?: TSchema) => {
	return useDecorators((target: any, key: string | symbol) => {
		wsHandlerStore.apply(target.constructor).addHandler(event, {
			eventStore: target.constructor,
			method: String(key),
			topic: "/",
			schema,
		});
	}, Use(WsValidateMiddleware));
};
