import {
	type RequestHandler,
	type ServerBuild,
	createRequestHandler,
} from "@remix-run/server-runtime";
import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	type VermiModule,
	asValue,
} from "@vermi/core";
import { StaticModule, type StaticModuleOptions } from "@vermi/static";

declare module "@vermi/core" {
	interface _AppContext {
		remix: RequestHandler;
	}
}

export interface RemixModuleOptions {
	build: string;
	assets: string;
}

@Module()
export class RemixModule implements VermiModule<RemixModuleOptions> {
	@Config() config!: RemixModuleOptions;

	constructor(protected configuration: Configuration) {}

	@AppHook("app:init")
	async init(context: AppContext) {
		const buildPath = Bun.fileURLToPath(this.config.build);
		const handler = createRequestHandler(
			(await import(buildPath)) as ServerBuild,
		);
		context.register("remix", asValue(handler));

		// remove last segment of the path
		const assets = Bun.fileURLToPath(this.config.assets).replace(
			/\/[^/]+$/,
			"",
		);

		const staticConfig: StaticModuleOptions = {
			assetsDir: assets,
			patterns: [/^\/assets\//],
		};

		this.configuration.setModuleConfig({
			module: StaticModule,
			config: [staticConfig],
		});
	}
}
