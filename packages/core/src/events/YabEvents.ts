export enum YabEvents {
	OnStarted = "started",
	OnInitialized = "initialized",
	OnRequest = "onRequest",
}

export type YabEventMap = {
	[YabEvents.OnStarted]: [];
	[YabEvents.OnInitialized]: [];
	[YabEvents.OnRequest]: [Request];
};
