import { useDecorators } from "@vermi/core";
import { eventStore } from "../stores";

export const Subscribe = (event: string) => {
	return useDecorators((target: any, key: string | symbol) => {
		eventStore.apply(target.constructor).addEvent(event, key);
	});
};
