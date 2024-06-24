import type { AnyPromiseFunction } from "@vermi/utils";
import type { RequestContext } from "./Context";

export interface InterceptorMethods {
	intercept<Next extends AnyPromiseFunction>(
		context: RequestContext,
		next: Next,
	): unknown;
}
