import type { Dictionary } from "@vermi/utils";
import type { AppOptions, ModuleConfig, VermiModule } from "../interfaces";

export class Configuration {
	options!: AppOptions;

	get bunOptions() {
		const { modules, env, log, ...options } = this.options;
		return options;
	}

	constructor(options?: AppOptions) {
		this.options = {
			modules: [],
			...options,
		};
	}

	getModuleConfig<Config extends Dictionary = Dictionary>(
		instance: VermiModule<Config>,
	) {
		return this.options.modules.find(
			(config) => config.moduleInstance.id === instance.id,
		);
	}

	setModuleConfig<Config extends Dictionary = Dictionary>(
		config: ModuleConfig<Config>,
	) {
		this.options.modules.push(config);
	}
}
