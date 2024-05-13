import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import {
	NotificationModule,
	type NotificationModuleConfig,
} from "./NotificationModule";
import type { AdapterConfigMap, Templates } from "./interfaces";

export const notification = <T extends Templates>(
	channels: Partial<AdapterConfigMap>,
	templates: T,
): UseModule<Class<NotificationModule<T>>, NotificationModuleConfig<T>> => {
	return {
		module: NotificationModule,
		args: {
			channels,
			templates,
		},
	};
};
