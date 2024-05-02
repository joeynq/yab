import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { AuthModule } from "./AuthModule";
import type { Strategy } from "./strategies";

export const auth = <S extends Strategy<any>>(
	strategy: AnyClass<S>,
	...args: ConstructorParameters<AnyClass<S>>
): YabUse<AnyClass<AuthModule<S>>> => {
	return {
		module: AuthModule,
		args: [
			{
				strategy: new strategy(...args),
			},
		],
	};
};
