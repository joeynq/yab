import type { RequestHandler } from "@remix-run/server-runtime";
import {
	Config,
	Inject,
	Logger,
	type LoggerAdapter,
	type RequestContext,
} from "@vermi/core";
import { After, Middleware, Res, type SlashedPath, Use } from "@vermi/router";
import type { RemixModuleOptions } from "../RemixModule";

@Middleware()
export class RemixMiddleware {
	@Config("RemixModule") config!: RemixModuleOptions;
	@Logger() logger!: LoggerAdapter;
	@Inject("remix") protected remix!: RequestHandler;

	@After()
	async after(context: RequestContext, result: unknown) {
		try {
			return this.remix(context.store.request, { data: await result });
		} catch (error) {
			this.logger.error(error);
			return Res.error(error as Error);
		}
	}
}

export function Remix(path?: SlashedPath) {
	return Use(RemixMiddleware);
}
