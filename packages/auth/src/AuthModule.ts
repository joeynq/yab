import {
	type AppContext,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	YabHook,
	YabModule,
	asValue,
} from "@yab/core";
import type { JWTVerifyResult } from "jose";
import type { Strategy } from "./strategies";

declare module "@yab/core" {
	interface _RequestContext {
		token: string | undefined;
		verifyToken<T>(): Promise<JWTVerifyResult<T>>;
		userId: string | undefined;
	}
}

export type AuthModuleConfig<S extends Strategy<any>> = {
	strategy: S;
};

export const AuthModuleKey = "auth:strategy";

@Module()
export class AuthModule<S extends Strategy<any>> extends YabModule<
	AuthModuleConfig<S>
> {
	@Logger()
	logger!: LoggerAdapter;

	constructor(public config: AuthModuleConfig<S>) {
		super();
	}

	@YabHook("app:init")
	async onInit(context: AppContext) {
		context.register(AuthModuleKey.toString(), asValue(this.config.strategy));
		try {
			await this.config.strategy.init?.();
			this.logger.info("AuthModule initialized with {name}. Issuer: {issuer}", {
				name: this.config.strategy.constructor.name,
				issuer: this.config.strategy.config.options.issuer,
			});
		} catch (error) {
			this.logger.error(error as any, "Error initializing auth module");
			throw error;
		}
	}

	@YabHook("app:enter-context")
	async onRequest(ctx: RequestContext) {
		await this.config.strategy.useContext(ctx);
	}
}
