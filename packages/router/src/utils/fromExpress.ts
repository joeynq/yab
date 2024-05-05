import type { RequestContext } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { RouterEvent } from "../event";
import type { Middleware } from "../interfaces/Middleware";

type NextFunction = (err?: any) => void;

type ExpressMiddleware = (
	req: Request,
	res?: Response,
	next?: NextFunction,
) => void;

/**
 * The function `fromExpress` converts an Express middleware function into a Middleware class for a
 * specific RouterEvent.
 * @param {ExpressMiddleware} expressMiddleware - The `expressMiddleware` parameter is a middleware
 * function from the Express.js framework that you want to adapt to be used as a middleware in another
 * framework or system.
 * @param {RouterEvent} event - The `event` parameter in the `fromExpress` function is of type
 * `RouterEvent`, which is an enum representing different events in the router lifecycle. The default
 * value for this parameter is `RouterEvent.BeforeRoute`. This enum is likely used to specify at which
 * point in the router lifecycle the middleware
 * @returns `ExpressMiddlewareAdapter` that implements the `Middleware` interface.
 * @example
 * ```ts
 * import { fromExpress } from "@yab/router";
 * import { Middleware } from "@yab/core";
 * import theExpressMiddleware from "express-middleware";
 *
 * class UserController {
 *  @Get("/")
 *  @Middleware(fromExpress(theExpressMiddleware))
 *  async getUser() {
 *    // Your code here
 *  }
 * }
 * ```
 */
export const fromExpressMiddleware = (
	expressMiddleware: ExpressMiddleware,
	event: RouterEvent = RouterEvent.BeforeRoute,
): AnyClass<Middleware> => {
	// create a class that implements the Middleware interface
	class ExpressMiddlewareAdapter implements Middleware {
		someProp?: string | undefined;
		#expressMiddleware = expressMiddleware;

		async run(context: RequestContext) {
			return new Promise<void>((resolve, reject) => {
				this.#expressMiddleware(
					context.resolveValue("request"),
					undefined,
					(err) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					},
				);
			});
		}
	}

	// add metadata to the class to indicate
	// this should be changed to `BeforeRoute()(ExpressMiddlewareAdapter, "run")`
	// below function is not correct, just an idea of how BeforeRoute could be used
	// Reflect.defineMetadata(
	// 	"RouteHook",
	// 	{ event, handler: "run" },
	// 	ExpressMiddlewareAdapter,
	// );

	return ExpressMiddlewareAdapter;
};
