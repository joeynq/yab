import { MikroORM, type Options } from "@mikro-orm/core";
import {
	type Context,
	ContextService,
	type InitContext,
	Inject,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import { getToken } from "./utils/getToken";

declare module "@yab/core" {
	interface Context {
		em: MikroORM["em"];
	}
}

export type MikroOrmModuleConfig = Options;

export class MikroOrmModule extends Module<MikroOrmModuleConfig> {
	#orm!: MikroORM;

	@Inject(ContextService)
	contextService!: ContextService;

	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: MikroOrmModuleConfig) {
		super();
	}

	@YabHook("app:init")
	async init({ container }: InitContext) {
		this.#orm = await MikroORM.init({
			...this.config,
			context: () => this.contextService.context?.em,
		});

		const url = new URL(this.#orm.config.getClientUrl());
		const isConnected = (await this.#orm.isConnected())
			? "successfully"
			: "unsuccessfully";

		this.logger.info(
			`MikroORM connected to database ${isConnected} to ${url.host
				.split(":")
				.join(":")}/${url.pathname.slice(1)}`,
		);

		container.registerValue(getToken(this.config.contextName), this.#orm);
	}

	@YabHook("app:request")
	async request(context: Context) {
		context.em = this.#orm.em.fork({ useContext: true });
	}

	@YabHook("app:exit")
	async exit() {
		await this.#orm.close();
		this.logger.info("MikroORM connection closed.");
	}
}
