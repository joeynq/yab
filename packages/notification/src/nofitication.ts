import type { UseModule } from "@vermi/core";
import type { AnyClass } from "@vermi/utils";
import { NotificationModule } from "./NotificationModule";
import type { AdapterConfigMap, Templates } from "./interfaces";

export const notification = <T extends Templates>(
	channels: Partial<AdapterConfigMap>,
	templates: T,
): UseModule<AnyClass<NotificationModule<T>>> => {
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
