import {
	type AppContext,
	Intercept,
	InterceptOptions,
	Interceptor,
	type InterceptorMethods,
	useDecorators,
} from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import type { EventType } from "../interfaces";
import { Event } from "../services";

export interface PublishOptions<Context extends AppContext, Result = unknown> {
	/**
	 * The event name.
	 */
	event: string | ((context: Context, result: Result) => EventType<Result>);

	/**
	 * A function that determines whether the event should be published.
	 */
	when?: "always" | ((event: any) => boolean);
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

		const dispatcher = context.store.eventDispatcher;
		if (when === "always" || when?.(result)) {
			const event =
				typeof getEvent === "function"
					? getEvent(context, result)
					: new Event(getEvent, result);
			dispatcher.dispatch(event);
		}
		return result;
	}
}

export function Publish<Context extends AppContext>(
	event: string | ((context: Context, result: any) => EventType<any>),
	options: Omit<PublishOptions<Context>, "event"> = {},
) {
	return useDecorators(
		Intercept(PublishInterceptor<Context>, { ...options, event }),
	);
}
