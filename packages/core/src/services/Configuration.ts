import type { Serve } from "bun";
import type { Module, YabOptions } from "../interfaces";

export class Configuration {
	options!: YabOptions;

	get bunOptions(): Omit<Serve, "fetch"> {
		const { modules, ...options } = this.options;
		return {
			...options,
		};
	}

	constructor(options?: YabOptions) {
		this.options = Object.assign(
			{
				modules: {},
			},
			options,
		);
	}

	getModuleOptions<Config>(instance: Module<Config>) {
		return this.options.modules[instance.id] as Config;
	}

	setModuleOptions<Config>(instance: Module<Config>, config: Config) {
		this.options.modules[instance.id] = config;
	}
}
