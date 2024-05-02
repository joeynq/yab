import type { YabUse } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import { NotificationModule } from "./NotificationModule";
import type { AdapterConfigMap, Templates } from "./interfaces";

export const notification = <T extends Templates>(
	channels: Partial<AdapterConfigMap>,
	templates: T,
): YabUse<AnyClass<NotificationModule<T>>> => {
	return {
		module: NotificationModule,
		args: [
			{
				channels,
				templates,
			},
		],
	};
};
