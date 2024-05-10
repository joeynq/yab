import { AutoHook, type RequestContext } from "@vermi/core";
import { type AnyClass, deepMerge } from "@vermi/utils";
import type { NextFunction } from "express";
import { RouterEvent } from "../event";
import {
	getMiddlewareMetadata,
	setMiddlewareMetadata,
} from "./middlewareMetadata";

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
): AnyClass<any> => {
	const ExpressMiddlewareAdapter = class {
		#expressMiddleware = expressMiddleware;

		async run(context: RequestContext) {
			return new Promise<void>((resolve, reject) => {
				this.#expressMiddleware(context.store.request, undefined, (err) => {
					if (err) {
						reject(err as Error);
					} else {
						resolve();
					}
				});
			});
		}
	};

	const existing = getMiddlewareMetadata(ExpressMiddlewareAdapter);

	const merged = deepMerge(existing, {
		target: ExpressMiddlewareAdapter,
		handler: {
			run: {
				event: RouterEvent.BeforeHandle,
			},
		},
	});
	setMiddlewareMetadata(ExpressMiddlewareAdapter, merged);

	AutoHook("router:init")(ExpressMiddlewareAdapter);

	return ExpressMiddlewareAdapter;
};
