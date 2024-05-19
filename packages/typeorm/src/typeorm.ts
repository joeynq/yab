import type { UseModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { DataSourceOptions } from "typeorm";
import { TypeormModule, type TypeormModuleConfig } from "./TypeormModule";

export const typeorm = (
	name: string,
	config: DataSourceOptions,
): UseModule<Class<TypeormModule>, TypeormModuleConfig> => ({
	module: TypeormModule,
	args: { [name]: config },
});
