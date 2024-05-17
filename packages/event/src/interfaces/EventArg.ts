export type EventTriggerOptions = {
	when?: "always" | boolean;
};

export interface EventArg<Payload> {
	eventId: string;
	invocationId?: string;
	time: number;
	payload: Payload;
}
