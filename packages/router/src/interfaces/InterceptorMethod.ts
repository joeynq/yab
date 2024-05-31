import type { RequestContext } from "@vermi/core";
import type { AnyPromiseFunction } from "@vermi/utils";

export interface InterceptorMethod {
	intercept<Next extends AnyPromiseFunction>(
		context: RequestContext,
		next: Next,
	): unknown;
}
