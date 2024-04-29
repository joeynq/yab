import type { AwilixContainer } from "awilix";
import type { Module, ModuleConstructor } from "./Module";

export type InjectionToken<T> = symbol | string | { new (...args: any[]): T };

export interface EnhancedContainer extends AwilixContainer {
	registerModule<M extends ModuleConstructor>(
		module: M,
		...args: ConstructorParameters<M>
	): Module;

	registerValue<T>(token: InjectionToken<T>, value: T): void;

	resolveClass<T>(token: InjectionToken<T>): T;
}
