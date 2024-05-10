import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import { AuthModule } from "./AuthModule";
import type { Strategy } from "./strategies";

export const auth = <S extends Strategy<any>, Class extends AnyClass<S>>(
	strategy: Class,
	...args: ConstructorParameters<Class>
): UseModule<AnyClass<AuthModule<S>>> => {
	return {
		module: AuthModule,
		args: [
			{
				strategy: new strategy(...args),
			},
		],
	};
};
