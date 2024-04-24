export type MapKey<M extends Map<unknown, unknown>> = M extends Map<
	infer K,
	unknown
>
	? K
	: never;
