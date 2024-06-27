import type { AsyncEvent } from "../entities";

export interface Transporter {
	subscribe(event: string, handler: Function): void;
	unsubscribe(event: string, handler: Function): void;
	publish<Data>(event: AsyncEvent<Data>): void;
}
