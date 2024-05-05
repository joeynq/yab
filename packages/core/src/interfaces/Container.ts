import type { AwilixContainer } from "awilix";

export type InjectionToken<T> = string | { new (...args: any[]): T };

export enum InjectionScope {
	Singleton = "SINGLETON",
	Transient = "TRANSIENT",
	Scoped = "SCOPED",
}

export interface EnhancedContainer<Context extends object>
	extends AwilixContainer<Context> {
	registerValue<T>(
		token: InjectionToken<T>,
		value: T,
		scope?: InjectionScope,
	): void;

	resolveClass<T>(token: InjectionToken<T>): T;

	resolveValue<T>(token: InjectionToken<T>): T;
}
