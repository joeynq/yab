import type { Parser } from "../parser/Parser";

export interface WsData {
	sid: string;
	parser: Parser;
	isAlive: boolean;
	[key: string]: any;
}
