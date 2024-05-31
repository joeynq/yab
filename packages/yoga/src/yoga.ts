import type { UseModule } from "@vermi/core";
import { YogaModule, type YogaModuleConfig } from "./YogaModule";

export const yoga = <Ctx extends Record<string, any>>(
	endpoint: string,
	options: Omit<YogaModuleConfig<Ctx>, "graphqlEndpoint">,
): UseModule<YogaModule<Ctx>> => [
	YogaModule,
	{
		...options,
		graphqlEndpoint: endpoint,
	},
];
