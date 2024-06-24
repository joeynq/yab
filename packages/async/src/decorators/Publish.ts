import {
	type AppContext,
	Intercept,
	InterceptOptions,
	Interceptor,
	type InterceptorMethods,
	useDecorators,
} from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import { AsyncEvent } from "../entities";
import type { Transporter } from "../interfaces";

export interface PublishOptions<Context extends AppContext, Result = unknown> {
	/**
	 * The event name.
	 */
	event: string | ((context: Context, result: Result) => AsyncEvent<Result>);

	/**
	 * A function that determines whether the event should be published.
	 */
	when?: "always" | ((event: any) => boolean);
	transport?: Transporter;
}

@Interceptor()
class PublishInterceptor<Context extends AppContext>
	implements InterceptorMethods<AppContext>
{
	@InterceptOptions()
	options!: PublishOptions<Context>;

	async intercept(context: Context, next: MaybePromiseFunction) {
		const { event: getEvent, when } = this.options;
		const result = await next(context);

		const transporter = context.resolve<Transporter>("transporter");
		if (when === "always" || when?.(result)) {
			const event =
				typeof getEvent === "function"
					? getEvent(context, result)
					: new AsyncEvent(getEvent, result);
			transporter.publish(event);
		}
		return result;
	}
}

export function Publish<Context extends AppContext>(
	event: string | ((context: Context, result: any) => AsyncEvent<any>),
	options: Omit<PublishOptions<Context>, "event"> = {},
) {
	return useDecorators(
		Intercept(PublishInterceptor<Context>, { ...options, event }),
	);
}
