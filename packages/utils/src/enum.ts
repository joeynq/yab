type StringValues<T> = {
	[K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

export type EnumValues<T> = `${StringValues<T>}`;
