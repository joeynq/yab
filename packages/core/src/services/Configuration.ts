import { deepMerge } from "@vermi/utils";
import { Injectable } from "../decorators";
import type { AppOptions, ModuleConfig } from "../interfaces";

@Injectable()
export class Configuration {
	options!: AppOptions;

	get bunOptions() {
		const { modules, env, log, ...options } = this.options;
		return options;
	}

	constructor(appConfig?: AppOptions) {
		this.options = {
			modules: new Map(),
			...appConfig,
		};
	}

	getModuleConfig<Config>(name: string): ModuleConfig<Config> | undefined {
		const module = this.options.modules.get(name);
		return module as ModuleConfig<Config> | undefined;
	}

	setModuleConfig<Config>(config: ModuleConfig<Config>) {
		const existing = this.options.modules.get(config.module.name);
		this.options.modules.set(config.module.name, deepMerge(existing, config));
	}
}
