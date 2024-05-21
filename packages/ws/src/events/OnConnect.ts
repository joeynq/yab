import { WsEvent } from "./WsEvent";
import { WsEvents } from "./WsEvents";

export class OnConnect extends WsEvent<null, "app"> {
	readonly event = WsEvents.Connect;
}
