import type { SlashedPath } from "@vermi/router";

export interface WsData {
	sid: string;
	path: SlashedPath;
	[key: string]: any;
}
