import {
	type Context,
	type EnhancedContainer,
	Module,
	YabHook,
} from "@yab/core";
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
	type: T;
	tokenFrom?: "header" | "query";
	tokenName?: string;
	strategies?: AuthStrategyMap[T];
};

export const AuthModuleKey = "auth:strategy";

const isBearerTokenAuthorize = (
	options: AuthStrategyMap[keyof AuthStrategyMap],
): options is BearerTokenAuthorize => {
	return "issuer" in options;
};
const isBasicTokenAuthorize = (
	options: AuthStrategyMap[keyof AuthStrategyMap],
): options is BasicTokenAuthorize => {
	return "username" in options;
};

export class AuthModule extends Module<AuthModuleConfig> {
	config: AuthModuleConfig<keyof AuthStrategyMap>;
	#strategy: Strategy<AuthStrategyMap[keyof AuthStrategyMap]>;

	constructor(config: Partial<AuthModuleConfig>) {
		super();

		this.config = {
			...config,
			type: config.type ?? "bearer",
			tokenFrom: config.tokenFrom ?? "header",
			tokenName: config.tokenName ?? "Authorization",
		};

		this.#strategy = this.#getStrategy(this.config.type);
	}

	#getStrategy<T extends keyof AuthStrategyMap>(type: T) {
		if (!this.config.strategies) {
			throw new Error("Strategies are required");
		}
		if (isBearerTokenAuthorize(this.config.strategies)) {
			return new BearerAuth({
				tokenFrom: this.config.tokenFrom,
				tokenName: this.config.tokenName,
				options: this.config.strategies,
				tokenType: "bearer",
			});
		}
		if (isBasicTokenAuthorize(this.config.strategies)) {
			return new BasicAuth({
				tokenFrom: this.config.tokenFrom,
				tokenName: this.config.tokenName,
				options: this.config.strategies,
				tokenType: "basic",
			});
		}
		throw new Error("Invalid strategy type");
	}

	@YabHook("app:init")
	async onInit({ container }: { container: EnhancedContainer }) {
		container.registerValue(AuthModuleKey.toString(), this.#strategy);
	}

	@YabHook("app:request")
	async onRequest(ctx: Context) {
		this.#strategy.useContext(ctx);
	}
}
