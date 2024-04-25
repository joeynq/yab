import type { EnhancedContainer } from "./Container";

export interface Context {
	request: Request;
	response: Response;
	container: EnhancedContainer;
	requestId: string;
}
