import type { UseModule } from "@vermi/core";
import type { DataSourceOptions } from "typeorm";
import { TypeormModule } from "./TypeormModule";

export const typeorm = (
	name: string,
	config: DataSourceOptions,
): UseModule<TypeormModule> => [TypeormModule, { [name]: config }];
