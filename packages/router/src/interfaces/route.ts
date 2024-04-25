export type SlashedPath = `/${string}`;

export type RouterConfig = {
	[key: SlashedPath]: unknown;
};
