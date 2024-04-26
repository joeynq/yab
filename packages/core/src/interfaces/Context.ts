import type { EnhancedContainer } from "./Container";

export interface Context {
	request: Request;
	container: EnhancedContainer;
	requestId: string;
}
