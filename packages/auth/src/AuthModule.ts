import {
	type Context,
	type InitContext,
	Injectable,
	Logger,
	type LoggerAdapter,
	Module,
	YabHook,
} from "@yab/core";
import type { Strategy } from "./strategies";

declare module "@yab/core" {
	interface Context {
		token: string | undefined;
		verifyToken(): Promise<any>;
	}
}

export type AuthModuleConfig<S extends Strategy<any>> = {
	strategy: S;
};

export const AuthModuleKey = "auth:strategy";

@Injectable()
export class AuthModule<S extends Strategy<any>> extends Module<
	AuthModuleConfig<S>
> {
	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: AuthModuleConfig<S>) {
		super();
	}

	@YabHook("app:init")
	async onInit({ container }: InitContext) {
		container.registerValue(AuthModuleKey, this.config.strategy);
		try {
			await this.config.strategy.init?.();
			this.logger.info(
				`Auth module initialized with ${this.config.strategy.constructor.name}. Issuer: ${this.config.strategy.config.options.issuer}`,
			);
		} catch (error) {
			this.logger.error(error as any, "Error initializing auth module");
			throw error;
		}
	}

	@YabHook("app:request")
	async onRequest(ctx: Context) {
		await this.config.strategy.useContext(ctx);
	}
}
