import { injectStore } from "../store";
import { Hook } from "./Hook";

export const InjectOn = (event: string) => {
	return (target: any) => {
		const injecting = injectStore.apply(target).get();

		for (const method of injecting) {
			Hook(event)(target.prototype, method);
		}
	};
};
