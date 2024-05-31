import { type RequestContext, hookStore } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { NextFunction } from "express";
import { Middleware } from "../decorators";
import { RouterEvent } from "../event";

type ExpressMiddleware = (
	req: Express.Request,
	res?: Express.Response,
	next?: NextFunction,
) => void;

/**
 * The function `fromExpress` converts an Express middleware function into a Middleware class for a
 * specific RouterEvent.
 * @param {ExpressMiddleware} expressMiddleware - The `expressMiddleware` parameter is a middleware
 * function from the Express.js framework that you want to adapt to be used as a middleware in another
 * framework or system.
 * @returns `ExpressMiddlewareAdapter` that implements the `Middleware` interface.
 * @example
 * ```ts
 * import { fromExpress } from "@vermi/router";
 * import { Middleware } from "@vermi/core";
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
): Class<any> => {
	const ExpressMiddlewareAdapter = class {
		#expressMiddleware = expressMiddleware;

		async run(context: RequestContext) {
			return new Promise<void>((resolve, reject) => {
				this.#expressMiddleware(context.store.request, undefined, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}
	};

	hookStore
		.apply(ExpressMiddlewareAdapter)
		.addHandler(RouterEvent.BeforeHandle, {
			target: ExpressMiddlewareAdapter,
			handler: new ExpressMiddlewareAdapter().run as any,
		});
	Middleware()(ExpressMiddlewareAdapter);

	return ExpressMiddlewareAdapter;
};
