import type { AnyClass } from "@yab/utils";
import type { AwilixContainer } from "awilix";
import type { Module } from "./Module";

export type InjectionToken<T> = symbol | string | { new (...args: any[]): T };

export interface EnhancedContainer extends AwilixContainer {
	registerModule<M extends AnyClass<Module>>(
		module: M,
		...args: ConstructorParameters<M>
	): Module;

	registerValue<T>(token: InjectionToken<T>, value: T): void;

	resolveClass<T>(token: InjectionToken<T>): T;

	resolveValue<T>(token: InjectionToken<T>): T;
}
