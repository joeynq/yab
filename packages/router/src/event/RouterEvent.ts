export enum RouterEvent {
	BeforeRoute = "beforeRoute",
	AfterRoute = "afterRoute",
}

export type RouterEventMap = {
	[RouterEvent.BeforeRoute]: [
		{
			path: string;
		},
	];
	[RouterEvent.AfterRoute]: [
		{
			path: string;
		},
	];
};
