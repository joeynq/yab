import { handlerStore } from "../stores/handlerStore";

export const EventStore = () => {
	return (target: any) => {
		handlerStore.apply(target);
	};
};
