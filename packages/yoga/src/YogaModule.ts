import {
	type Context,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import type { Server } from "bun";
import {
	type YogaServerInstance,
	type YogaServerOptions,
	createYoga,
} from "graphql-yoga";

export type YogaModuleConfig<UserContext> = YogaServerOptions<
	Context,
	UserContext
>;

export class YogaModule<UserContext extends Record<string, any>> extends Module<
	YogaModuleConfig<UserContext>
> {
	#yoga: YogaServerInstance<Context, UserContext>;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: YogaModuleConfig<UserContext>) {
		super();

		this.#yoga = createYoga(config);
	}

	@YabHook("app:request")
	async init(context: Context) {
		const url = new URL(context.request.url, context.serverUrl);
		if (url.pathname.startsWith(this.#yoga.graphqlEndpoint)) {
			return this.#yoga.handleRequest(context.request, context);
		}
	}

	@YabHook("app:started")
	async onStarted(server: Server) {
		this.logger.info(
			`Yoga server is running on ${new URL(
				this.#yoga.graphqlEndpoint,
				`http://${server.hostname}:${server.port}`,
			)}`,
		);
	}
}
