import { type Class, camelCase, mapToRecords } from "@vermi/utils";
import { type BuildResolver, RESOLVER, asClass, asValue } from "awilix";
import { type Hooks, containerRef } from "../services";
import { dependentStore, hookStore } from "../store";

const getResolvers = (services: Class<any>[]) => {
	const registering: Map<string, BuildResolver<any>> = new Map();

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
	for (const serviceClass of services) {
		// @ts-ignore
		const registeringName = serviceClass[RESOLVER].name || serviceClass.name;
		registering.set(camelCase(registeringName), asClass(serviceClass));
	}

	return registering;
};

const registerHooks = (service: Hooks, providers: Class<any>[]) => {
	for (const provider of Object.values(providers)) {
		const serviceHooks = hookStore.apply(provider).get();

		for (const [event, handlers] of serviceHooks.entries()) {
			for (const { target, handler, scope } of handlers) {
				const useTarget = target?.name && target.name !== provider.name;
				const instance = containerRef().expose().resolve<any>(provider.name);
				service.register(event, {
					target: useTarget ? target : undefined,
					handler: handler.bind(instance),
					scope,
				});
			}
		}
	}
};

export function registerProviders(...providers: Class<any>[]) {
	if (!providers.length) {
		return {};
	}
	const container = containerRef();
	const resolvers = mapToRecords(getResolvers(providers));
	container.register(resolvers);

	registerHooks(container.cradle.hooks, providers);
	container.register("hooks", asValue(container.cradle.hooks));
}
