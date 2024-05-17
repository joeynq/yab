import { handlerStore } from "../stores/handlerStore";

export const On = (eventKey: string): MethodDecorator => {
	return (target: any, propertyKey: string | symbol) => {
		handlerStore.apply(target.constructor).addHandler({
			class: target.constructor,
			eventKey: eventKey,
			methodName: propertyKey.toString(),
		});
	};
};
