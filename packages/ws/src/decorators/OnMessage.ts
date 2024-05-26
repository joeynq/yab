import { wsHandlerStore } from "../stores";

export const OnMessage = (event: string) => {
	return (target: any, key: string) => {
		wsHandlerStore.apply(target.constructor).addHandler(event, {
			eventStore: target.constructor,
			method: key,
			topic: "/",
		});
	};
};
