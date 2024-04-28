import { MikroORM, type Options, RequestContext } from "@mikro-orm/core";
import {
	type Context,
	ContextService,
	Inject,
	Module,
	YabHook,
	useContainerRef,
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

	constructor(public config: MikroOrmModuleConfig) {
		super();
	}

	@YabHook("app:init")
	async init() {
		this.#orm = await MikroORM.init({
			...this.config,
			context: () => this.contextService.context?.em,
		});

		useContainerRef().registerValue(
			getToken(this.config.contextName),
			this.#orm,
		);
	}

	@YabHook("app:request")
	async request(context: Context) {
		context.em = this.#orm.em.fork({ useContext: true });
	}
}
