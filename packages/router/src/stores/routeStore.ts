import { createStore, getStoreData } from "@vermi/core";
import { format } from "@vermi/utils";
import type {
	FullPath,
	HTTPMethod,
	Operation,
	Routes,
	SlashedPath,
} from "../interfaces";

export const RouterMetadataKey: unique symbol = Symbol("Router");

export type RouterAPI = {
	findPath(actionName: string | symbol): FullPath | undefined;
	addRoute(
		method: HTTPMethod,
		path: SlashedPath,
		propertyKey: string,
		routeMetadata?: Pick<Operation, "args" | "responses" | "operationId">,
	): Routes["paths"];
	updateRoute(path: FullPath, updater: (current: Operation) => Operation): void;
	updatePathPrefix(prefix: { [key: string]: SlashedPath }):
		| Routes["paths"]
		| undefined;
};

export const routeStore = createStore<Routes["paths"], RouterAPI>(
	RouterMetadataKey,
	(target, get, set) => ({
		findPath(actionName: string | symbol) {
			const current = get();
			if (!current) return;

			for (const [path, { handler }] of current) {
				if (
					handler.target.name === target.name &&
					handler.action === actionName
				) {
					return path;
				}
			}
		},
		addRoute(method, path, propertyKey, { args, operationId } = {}) {
			const current = get() || new Map<FullPath, Operation>();

			const full = `${method}${path}` as FullPath;

			current.set(full, {
				handler: {
					target,
					action: propertyKey,
				},
				args,
				operationId,
			});

			set(current);
			return current;
		},
		updateRoute(path, updater) {
			const current = get();
			const route = current?.get(path);

			if (!route || !current) return;

			current.set(path, updater(route));

			set(current);
		},
		updatePathPrefix(prefix) {
			const current = get();
			if (!current) return;
			const updated = new Map<FullPath, Operation>();
			for (const [key, operation] of current) {
				const newKey = format(key, prefix)
					.replace(/\/$/, "")
					.replace(/\/{2,}/g, "/");
				if (Object.hasOwn(prefix, "prefix")) {
					operation.prefix = prefix.prefix;
				}
				if (Object.hasOwn(prefix, "mount")) {
					operation.mount = prefix.mount;
				}
				updated.set(newKey as FullPath, operation);
			}
			set(updated);
			return updated;
		},
	}),
	() => new Map(),
);

export const getRoutes = () => {
	return getStoreData<Routes["paths"]>(RouterMetadataKey);
};
