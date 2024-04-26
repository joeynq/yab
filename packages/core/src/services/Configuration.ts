import { type Dictionary, deepMerge } from "@yab/utils";
import type { Serve } from "bun";
import type { Module, ModuleConfig, YabOptions } from "../interfaces";

export class Configuration {
	options!: YabOptions;

	get bunOptions(): Omit<Serve, "fetch"> {
		const { modules, ...options } = this.options;
		return options;
	}

	get #modulesConfig() {
		return this.options.modules;
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
		instance: Module<Config>,
	) {
		return this.#modulesConfig.find((config) => config.id === instance.id);
	}

	setModuleConfig<Config extends Dictionary = Dictionary>(
		instance: Module<Config>,
		extended: ModuleConfig<Config>,
	) {
		this.options.modules.push(
			deepMerge(
				{
					name: instance.constructor.name,
					id: instance.id,
					config: instance.config,
				},
				extended,
			),
		);
	}
}
