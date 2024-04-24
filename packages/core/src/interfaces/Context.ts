import type { Container } from "diod";

export interface Context {
	request: Request;
	response: Response;
	container: Container;
	requestId: string;
}
