import type { Dictionary } from "@yab/utils";
import type { ModuleConfig, YabModule, YabOptions } from "../interfaces";

export class Configuration {
	options!: YabOptions;

	get bunOptions() {
		const { modules, env, logLevel, ...options } = this.options;
		return options;
	}

	constructor(options?: YabOptions) {
		this.options = Object.assign(
			{
				modules: [],
			},
			options,
		);
	}

	getModuleConfig<Config extends Dictionary = Dictionary>(
		instance: YabModule<Config>,
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
