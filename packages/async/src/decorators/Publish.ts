import {
	type AppContext,
	Intercept,
	Interceptor,
	type InterceptorMethods,
	useDecorators,
} from "@vermi/core";
import { InterceptOptions } from "@vermi/core";
import type { MaybePromiseFunction } from "@vermi/utils";
import { AsyncEvent } from "../entities";
import type { Transporter } from "../interfaces";

export interface PublishOptions {
	/**
	 * The topic of the event to publish.
	 */
	topic: string;

	/**
	 * A function that returns the ID of the invoker.
	 */
	invokerId?: <Context extends AppContext>(context: Context) => string;

	/**
	 * The name of the event to publish.
	 */
	event: string;

	/**
	 * A function that determines whether the event should be published.
	 */
	when?: "always" | ((event: any) => boolean);
}

@Interceptor()
class PublishInterceptor implements InterceptorMethods {
	@InterceptOptions()
	options!: PublishOptions;

	async intercept(context: AppContext, next: MaybePromiseFunction) {
		const { event: eventName, invokerId, when, topic } = this.options;
		const result = await next();

		const transporter = context.resolve<Transporter>("transporter");
		if (when === "always" || when?.(result)) {
			const event = new AsyncEvent(topic, eventName, result);
			if (invokerId) {
				event.invokerId = invokerId(context);
			}
			transporter.publish(event);
		}
		return next();
	}
}

export function Publish(options: PublishOptions) {
	return useDecorators(Intercept(PublishInterceptor, options));
}
