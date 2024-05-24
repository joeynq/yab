import { type Class, camelCase, mapToRecords } from "@vermi/utils";
import { type BuildResolver, asClass } from "awilix";
import type { EnhancedContainer } from "../interfaces";
import { type Hooks, containerRef } from "../services";
import { dependentStore, hookStore } from "../store";

const getResolvers = (services: Class<any>[]) => {
	const registering: Map<string, BuildResolver<any>> = new Map();

	for (const serviceClass of services) {
		registering.set(camelCase(serviceClass.name), asClass(serviceClass));
	}

	const dependentServices = dependentStore.combineStore(...services);
	if (dependentServices?.length) {
		const dependentResolvers = getResolvers(dependentServices);
		for (const [key, value] of dependentResolvers.entries()) {
			if (registering.has(camelCase(key))) {
				continue;
			}
			registering.set(camelCase(key), value);
		}
	}

	return registering;
};

const buildServices = (
	container: EnhancedContainer<any>,
	resolvers: Record<string, BuildResolver<any>>,
) => {
	return Object.entries(resolvers).reduce(
		(acc, [key, value]) => {
			acc[key] = container.build(value);
			return acc;
		},
		{} as Record<string, any>,
	);
};

const registerHooks = (service: Hooks, instances: Record<string, any>) => {
	for (const [_, instance] of Object.entries(instances)) {
		const ctor = instance.constructor;
		const serviceHooks = hookStore.apply(ctor).get();

		for (const [event, handlers] of serviceHooks.entries()) {
			for (const { target, handler, scope } of handlers) {
				service.register(event, {
					target: target?.name === ctor.name ? undefined : target,
					handler: handler.bind(instance),
					scope,
				});
			}
		}
	}
};

export const registerProvider = (name: string, provider: Class<any>) => {
	const container = containerRef();
	const resolver = asClass(provider);
	const instance = container.build(resolver);
	container.register(camelCase(name), resolver);

	registerHooks(container.cradle.hooks, instance);

	return instance;
};

export function registerProviders(...providers: Class<any>[]) {
	if (!providers.length) {
		return {};
	}
	const container = containerRef();

	const resolvers = mapToRecords(getResolvers(providers));
	const instances = buildServices(container, resolvers);
	container.register(resolvers);

	registerHooks(container.cradle.hooks, instances);

	return instances;
}
