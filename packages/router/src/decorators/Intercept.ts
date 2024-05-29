import {
	type RequestContext,
	asClass,
	dependentStore,
	useDecorators,
} from "@vermi/core";
import type { Class } from "@vermi/utils";

export const Intercept = <Interceptor extends Class<any>>(
	interceptor: Interceptor,
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

			descriptor.value = async <Context extends RequestContext>(
				context: Context,
			) => {
				const interceptorInstance = context.build(asClass(interceptor));

				return interceptorInstance.intercept(context, originalMethod);
			};
		},
	);
};
