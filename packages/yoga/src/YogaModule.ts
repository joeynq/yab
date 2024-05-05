import {
	type AppContext,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
	type _AppContext,
} from "@yab/core";
import type { Server } from "bun";
import {
	type YogaServerInstance,
	type YogaServerOptions,
	createYoga,
} from "graphql-yoga";

export type YogaModuleConfig<UserContext> = YogaServerOptions<
	_AppContext,
	UserContext
>;

export class YogaModule<UserContext extends Record<string, any>> extends Module<
	YogaModuleConfig<UserContext>
> {
	#yoga: YogaServerInstance<_AppContext, UserContext>;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: YogaModuleConfig<UserContext>) {
		super();

		this.#yoga = createYoga(config);
	}

	@YabHook("app:request")
	async init(context: AppContext) {
		const request = context.resolve<Request>("request");
		const serverUrl = context.resolve("serverUrl") as string;
		const url = new URL(request.url, serverUrl);
		if (url.pathname.startsWith(this.#yoga.graphqlEndpoint)) {
			return this.#yoga.handleRequest(request, context.cradle);
		}
	}

	@YabHook("app:started")
	async onStarted(_: AppContext, server: Server) {
		this.logger.info(
			`Yoga server is running on ${new URL(
				this.#yoga.graphqlEndpoint,
				`http://${server.hostname}:${server.port}`,
			)}`,
		);
	}
}
