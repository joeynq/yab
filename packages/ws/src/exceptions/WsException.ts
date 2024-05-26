import type { EnumValues } from "@vermi/utils";

export enum WsCloseCode {
	Normal = 1000,
	GoingAway = 1001,
	ProtocolError = 1002,
	UnsupportedData = 1003,
	NoStatus = 1005,
	Abnormal = 1006,
	InvalidData = 1007,
	PolicyViolation = 1008,
	MessageTooBig = 1009,
	MissingExtension = 1010,
	InternalError = 1011,
	ServiceRestart = 1012,
	TryAgainLater = 1013,
	BadGateway = 1014,
	TlsHandshake = 1015,
}

export abstract class WsException<
	Code extends EnumValues<typeof WsCloseCode, number> = EnumValues<
		typeof WsCloseCode,
		number
	>,
> extends Error {
	abstract code: Code;
	constructor(
		public sid: string,
		public reason: string,
	) {
		super(reason);
	}
}
