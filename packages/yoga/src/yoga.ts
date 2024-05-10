import type { UseModule } from "@vermi/core";
import type { AnyClass } from "../../utils/dist";
import { YogaModule, type YogaModuleConfig } from "./YogaModule";

export const yoga = <Ctx extends Record<string, any>>(
	endpoint: string,
	options: Omit<YogaModuleConfig<Ctx>, "graphqlEndpoint">,
): UseModule<AnyClass<YogaModule<Ctx>>> => ({
	module: YogaModule,
	args: [
		{
			...options,
			graphqlEndpoint: endpoint,
		},
	],
});
