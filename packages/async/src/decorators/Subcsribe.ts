import { useDecorators } from "@vermi/core";
import { wsHandlerStore } from "../stores";

export const Subscribe = (event: string) => {
	return useDecorators((target: any, key: string | symbol) => {
		wsHandlerStore.apply(target.constructor).addHandler(event, key);
	});
};
