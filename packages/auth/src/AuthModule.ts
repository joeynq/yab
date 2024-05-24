import {
	type AppContext,
	AppHook,
	type Configuration,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
	asValue,
} from "@vermi/core";
import { Guard, type RouteMatch } from "@vermi/router";
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

export type AuthModuleConfig<S extends Strategy<any>> = Record<
	string,
	{
		strategy: S;
		scheme: Record<string, SecurityScheme>;
	}
>;

type InitStatus = "success" | "error";

@Module()
export class AuthModule<S extends Strategy<any>> extends VermiModule<
	AuthModuleConfig<S>
> {
	@Logger()
	private logger!: LoggerAdapter;

	constructor(protected configuration: Configuration) {
		super();
	}

	@AppHook("app:init")
	async onInit(context: AppContext) {
		const config = this.config;

		const logs: { strategy: string; schemeName: string; status: InitStatus }[] =
			[];

		const toBeRegistered: Record<string, Strategy<any>> = {};
		for (const [name, { strategy, scheme }] of Object.entries(config)) {
			let status: "success" | "error" = "success";

			try {
				await strategy.init?.();
				toBeRegistered[Object.keys(scheme)[0]] = strategy;
			} catch (error) {
				status = "error";
				this.logger.error(
					error as any,
					`Error initializing auth strategy ${name}`,
				);
			}

			logs.push({ strategy: name, schemeName: Object.keys(scheme)[0], status });
		}

		context.register({
			authStrategies: asValue(toBeRegistered),
		});
		this.logger.info("Auth strategies initialized");
	}

	@Guard()
	async onGuard(ctx: RequestContext, route: { store: RouteMatch }) {
		if (!route.store.security) {
			return;
		}
		const currentScheme = Array.from(route.store.security.keys())[0];

		const strategy = ctx.store.authStrategies[currentScheme];
		if (!strategy) {
			throw new Error(`No strategy found for scheme ${currentScheme}`);
		}

		await strategy.useContext(ctx);
	}
}
