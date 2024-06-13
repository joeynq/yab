import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { AuthModule } from "./AuthModule";
import type { Strategy } from "./strategies";

export interface AuthOptions<C> {
	config: C;
	schemeName?: string;
}

export const auth = <
	S extends Strategy<any>,
	C extends ConstructorParameters<Class<S>>[0],
>(
	Strategy: Class<S>,
	{ config, schemeName }: AuthOptions<C>,
): UseModule<AuthModule<S>> => {
	const strategy = new Strategy(config);
	const name = schemeName || Strategy.name;

	return [
		AuthModule,
		{
			[Strategy.name]: {
				strategy,
				scheme: {
					[name]: strategy.securityScheme,
				},
			},
		},
	];
};
