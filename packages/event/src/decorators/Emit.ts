import { containerRef } from "@vermi/core";
import type { EventEmitter } from "tseep";

export const Emit = (eventKey: string): MethodDecorator => {
	return (_, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			const emitter = containerRef().resolve<EventEmitter>("emitter");
			const result = await originalMethod.apply(this, args);
			emitter.emit(eventKey, result);
			return result;
		};
	};
};
