import type { RequestContext } from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import { Interceptor } from "../decorators/Interceptor";
import type { InterceptorMethod } from "../interfaces";
import { getValue } from "../utils";

@Interceptor()
export class ArgsPipingInterceptor implements InterceptorMethod {
	async intercept(context: RequestContext, next: MaybePromiseFunction) {
		const payload = context.store.payload;
		const args = context.store.route.args;
		if (!args?.length) {
			return next(context);
		}

		const values: any[] = [];

		for (const arg of args) {
			let value = getValue(arg.in, payload);

			if (arg.pipes) {
				for (const pipe of arg.pipes) {
					value = await context.build(pipe).map(value);
				}
			}

			values.push(value);
		}
		return next(...values);
	}
}
