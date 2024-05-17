import { EventStore, On } from "@vermi/event";

@EventStore()
export class UserEvent {
	@On("test")
	sendMail(payload: any) {
		console.log(payload);
	}
}
