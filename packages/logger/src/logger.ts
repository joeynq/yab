import type { LoggerAdapter, YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { LoggerModule } from "./LoggerModule";

export const logger = <Adapter extends LoggerAdapter>(
	adapter: AnyClass<Adapter>,
	...args: ConstructorParameters<AnyClass<Adapter>>
): YabUse<AnyClass<LoggerModule<Adapter>>> => {
	return {
		module: LoggerModule,
		args: [
			{
				adapter: new adapter(...args),
			},
		],
	};
};
