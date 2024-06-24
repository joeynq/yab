import { type Class, camelCase } from "@vermi/utils";
import type { RequestContext } from "../interfaces";
import { dependentStore } from "../store";
import { asClass, asValue, useDecorators } from "../utils";

export const Intercept = <Interceptor extends Class<any>>(
	interceptor: Interceptor,
	options?: any,
): MethodDecorator => {
	return useDecorators(
		(target: any) => {
			dependentStore.apply(target.constructor).addDependents(interceptor);
		},
		(
			target: any,
			propertyKey: string | symbol,
			descriptor: TypedPropertyDescriptor<any>,
		) => {
			const originalMethod = target[propertyKey];
			const name = camelCase(interceptor.name);

			descriptor.value = async <Context extends RequestContext>(
				context: Context,
			) => {
				options && context.register(`${name}.options`, asValue(options));
				const interceptorInstance = context.build(asClass(interceptor));

				return interceptorInstance.intercept(context, (...args: any[]) =>
					originalMethod.call(target, ...args),
				);
			};
		},
	);
};
