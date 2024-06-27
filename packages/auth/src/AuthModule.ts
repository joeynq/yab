import {
	type AppContext,
	AppHook,
	Config,
	Logger,
	type LoggerAdapter,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import { tryRun } from "@vermi/utils";
import type { JWTVerifyResult } from "jose";
import type { SecurityScheme } from "./interfaces";
import type { Strategy } from "./strategies";

declare module "@vermi/core" {
	interface _RequestContext {
		token: string | undefined;
		verifyToken<T>(): Promise<JWTVerifyResult<T>>;
		userId: string | undefined;
		authStrategies: Record<string, Strategy<any>>;
	}
}

export type AuthModuleConfig<S extends Strategy<any>> = {
	strategy: S;
	scheme: Record<string, SecurityScheme>;
}[];

type InitStatus = "success" | "error";

@Module()
export class AuthModule<S extends Strategy<any>> extends VermiModule<
	AuthModuleConfig<S>
> {
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: AuthModuleConfig<S>;

	@AppHook("app:init")
	async onInit(context: AppContext) {
		const config = this.config;

		const logs: { strategy: string; schemeName: string; status: InitStatus }[] =
			[];

		const toBeRegistered: Record<string, Strategy<any>> = {};
		for (const { strategy, scheme } of config) {
			let status: "success" | "error" = "success";
			const name = strategy.constructor.name;

			const [error] = await tryRun(async () => {
				await strategy.init?.();
				toBeRegistered[Object.keys(scheme)[0]] = strategy;
			});

			if (error) {
				status = "error";
				this.logger.error(error, `Error initializing auth strategy ${name}`);
			}

			logs.push({ strategy: name, schemeName: Object.keys(scheme)[0], status });
		}

		context.register({
			authStrategies: asValue(toBeRegistered),
		});
		this.logger.info("Auth strategies initialized");
	}
}
