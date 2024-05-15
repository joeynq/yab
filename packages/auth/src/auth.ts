import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { AuthModule, type AuthModuleConfig } from "./AuthModule";
import type { Strategy } from "./strategies";

export const auth = <S extends Strategy<any>, SClass extends Class<S>>(
	strategy: SClass,
	...args: ConstructorParameters<SClass>
): UseModule<Class<AuthModule<S>>, AuthModuleConfig<S>> => {
	return {
		module: AuthModule,
		args: {
			strategy: new strategy(...args),
		},
	};
};
