import type { UseModule } from "@vermi/core";
import type { Class } from "../../utils/dist";
import { YogaModule, type YogaModuleConfig } from "./YogaModule";

export const yoga = <Ctx extends Record<string, any>>(
	endpoint: string,
	options: Omit<YogaModuleConfig<Ctx>, "graphqlEndpoint">,
): UseModule<Class<YogaModule<Ctx>>, YogaModuleConfig<Ctx>> => ({
	module: YogaModule,
	args: {
		...options,
		graphqlEndpoint: endpoint,
	},
});
