import {
	type AppContext,
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	asValue,
} from "@vermi/core";
import type { JWTVerifyResult } from "jose";
import type { Strategy } from "./strategies";

declare module "@vermi/core" {
	interface _RequestContext {
		token: string | undefined;
		verifyToken<T>(): Promise<JWTVerifyResult<T>>;
		userId: string | undefined;
		authStrategy: Strategy<any>;
	}
}

export type AuthModuleConfig<S extends Strategy<any>> = {
	strategy: S;
};

@Module()
export class AuthModule<S extends Strategy<any>> extends VermiModule<
	AuthModuleConfig<S>
> {
	constructor(
		protected configuration: Configuration,
		private logger: LoggerAdapter,
	) {
		super();
	}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		context.register("authStrategy", asValue(this.config.strategy));
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

	@AppHook("app:enter-context")
	async onRequest(ctx: RequestContext) {
		await this.config.strategy.useContext(ctx);
	}
}
