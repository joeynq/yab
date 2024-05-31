import { type _RequestContext } from "@vermi/core";
import { Middleware, validate } from "@vermi/router";
import { WsHook } from "../decorators";
import { WsEvent } from "../events";
import type { WsContext } from "../interfaces";
import type { WsHandler } from "../stores";

@Middleware()
export class WsValidateMiddleware {
	@WsHook("ws-hook:initEvent")
	async beforeEvent(context: WsContext) {
		context.register<_RequestContext["payload"]>("payload", {
			resolve: (c) => {
				const event = c.resolve<WsEvent<any>>("event");
				return { body: event.data };
			},
			lifetime: "SCOPED",
		});
	}

	@WsHook("ws-hook:guard")
	async validate(context: WsContext, handlerData: WsHandler) {
		const schema = handlerData.schema;
		const data = context.store.payload.body;

		if (!schema) {
			return;
		}

		await validate(schema, data, {} as any);
	}
}
