import { useDecorators } from "@vermi/core";
import { Intercept } from "@vermi/router";
import { ArgsPipingInterceptor } from "../interceptors";
import { Validate } from "../middlewares";
import { wsHandlerStore } from "../stores";

export const Subscribe = (event: string) => {
	return useDecorators(
		(target: any, key: string | symbol) => {
			wsHandlerStore.apply(target.constructor).addHandler(event, key);
		},
		Intercept(ArgsPipingInterceptor),
		Validate,
	);
};
