export interface Transporter {
	subscribe(event: string, handler: Function): void;
	unsubscribe(event: string, handler: Function): void;
	publish(event: string, data: any): void;
}
