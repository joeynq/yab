import {
	type AppContext,
	AppHook,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	type _AppContext,
} from "@vermi/core";
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

@Module()
export class YogaModule<
	UserContext extends Record<string, any>,
> extends VermiModule<YogaModuleConfig<UserContext>> {
	#yoga: YogaServerInstance<_AppContext, UserContext>;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: YogaModuleConfig<UserContext>) {
		super();

		this.#yoga = createYoga({
			...config,
		});
	}

	@AppHook("app:request")
	async init(context: RequestContext) {
		const { request, serverUrl } = context.store;
		const url = new URL(request.url, serverUrl);
		if (url.pathname.startsWith(this.#yoga.graphqlEndpoint)) {
			return this.#yoga.handleRequest(request, context.store);
		}
	}

	@AppHook("app:started")
	async onStarted(_: AppContext, server: Server) {
		this.logger.info("Yoga server is running on {url}", {
			url: new URL(
				this.#yoga.graphqlEndpoint,
				`http://${server.hostname}:${server.port}`,
			),
		});
	}
}
