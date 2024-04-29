import { type Context, type InitContext, Module, YabHook } from "@yab/core";
import type { Strategy } from "./strategies";
import {
	BasicAuth,
	type BasicTokenAuthorize,
	BearerAuth,
	type BearerTokenAuthorize,
} from "./strategies";

declare module "@yab/core" {
	interface Context {
		token: string | undefined;
		verifyToken(): Promise<any>;
	}
}

type AuthStrategyMap = {
	bearer: BearerTokenAuthorize;
	basic: BasicTokenAuthorize;
};

export type AuthModuleConfig<
	T extends keyof AuthStrategyMap = keyof AuthStrategyMap,
> = {
	type?: T;
	tokenFrom?: "header" | "query";
	tokenName?: string;
	authOptions: AuthStrategyMap[T];
};

export const AuthModuleKey = "auth:strategy";

const isBearerTokenAuthorize = (
	options: AuthModuleConfig,
): options is AuthModuleConfig<"bearer"> => {
	return options.type === "bearer";
};
const isBasicTokenAuthorize = (
	options: AuthModuleConfig,
): options is AuthModuleConfig<"basic"> => {
	return options.type === "basic";
};

export class AuthModule extends Module<AuthModuleConfig> {
	config: AuthModuleConfig<keyof AuthStrategyMap>;
	#strategy: Strategy<AuthStrategyMap[keyof AuthStrategyMap]>;

	constructor(config: AuthModuleConfig) {
		super();

		this.config = {
			type: config.type ?? "bearer",
			tokenFrom: config.tokenFrom ?? "header",
			tokenName: config.tokenName ?? "Authorization",
			authOptions: config.authOptions,
		};

		this.#strategy = this.#getStrategy();
	}

	#getStrategy() {
		if (!this.config.authOptions) {
			throw new Error("Strategies are required");
		}
		if (isBearerTokenAuthorize(this.config)) {
			return new BearerAuth({
				tokenFrom: this.config.tokenFrom,
				tokenName: this.config.tokenName,
				options: this.config.authOptions,
				tokenType: "bearer",
			});
		}
		if (isBasicTokenAuthorize(this.config)) {
			return new BasicAuth({
				tokenFrom: this.config.tokenFrom,
				tokenName: this.config.tokenName,
				options: this.config.authOptions,
				tokenType: "basic",
			});
		}
		throw new Error("Invalid strategy type");
	}

	@YabHook("app:init")
	async onInit({ container }: InitContext) {
		container.registerValue(AuthModuleKey.toString(), this.#strategy);
	}

	@YabHook("app:request")
	async onRequest(ctx: Context) {
		this.#strategy.useContext(ctx);
	}
}
