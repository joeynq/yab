import { type EntityManager, MikroORM, type Options } from "@mikro-orm/core";
import {
	type AppContext,
	ContextService,
	Inject,
	InjectionScope,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
	YabModule,
	asValue,
} from "@yab/core";
import { getToken } from "./utils";

declare module "@yab/core" {
	interface _AppContext {
		em?: MikroORM["em"];
	}
}

export type MikroOrmModuleConfig = Options;

@Module()
export class MikroOrmModule extends YabModule<MikroOrmModuleConfig> {
	#orm!: MikroORM;

	@Inject(ContextService)
	contextService!: ContextService;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: MikroOrmModuleConfig) {
		super();
	}

	@YabHook("app:init")
	async init(context: AppContext) {
		this.#orm = await MikroORM.init({
			...this.config,
			context: () => context.resolve<EntityManager>("em"),
		});

		const url = new URL(this.#orm.config.getClientUrl());
		const isConnected = (await this.#orm.isConnected())
			? "successfully"
			: "unsuccessfully";

		this.logger.info(
			"MikroORM connected to database {isConnected} to {url.protocol}//{url.host}{url.pathname}{url.search}",
			{ url, isConnected },
		);

		const contextName = this.#orm.config.get("contextName");
		context.register({
			[`${getToken(contextName)}.orm`]: asValue(this.#orm),
			[`${getToken(contextName)}.em`]: {
				lifetime: InjectionScope.Scoped,
				resolve: (container) =>
					container
						.resolve<MikroORM>(`${getToken(contextName)}.orm`)
						.em.fork({ useContext: true }),
			},
		});
	}

	@YabHook("app:exit")
	async exit() {
		await this.#orm.close();
		this.logger.info("MikroORM connection closed.");
	}
}
