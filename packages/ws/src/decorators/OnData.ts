import type { TSchema } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { modelStore } from "@vermi/openapi";
import { type Class, isClass, pascalCase } from "@vermi/utils";
import { WsValidateMiddleware } from "../middlewares";
import { wsHandlerStore } from "../stores";
import { Use } from "./Use";

export const OnData = (event: string, model?: Class<any> | TSchema) => {
	return useDecorators((target: any, key: string | symbol) => {
		let schema: TSchema | undefined = undefined;

		if (isClass(model)) {
			schema = modelStore.apply(model).getSchema(pascalCase(model.name));
		} else if (model) {
			schema = model;
		}

		wsHandlerStore.apply(target.constructor).addHandler(event, {
			eventStore: target.constructor,
			method: String(key),
			topic: "/",
			schema,
		});
	}, Use(WsValidateMiddleware));
};
