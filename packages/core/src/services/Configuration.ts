import type { Serve } from "bun";
import type { ModuleConstructor, YabOptions } from "../interfaces/Module";

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
				modules: [],
			},
			options,
		);
	}

	getModuleOptions(module: ModuleConstructor) {
		return (
			this.options.modules?.find(([mod]) => mod === module)?.slice(1) ?? []
		);
	}

	setModuleOptions(module: ModuleConstructor, ...args: unknown[]) {
		const modIndex = this.options.modules?.findIndex(([mod]) => mod === module);
		if (modIndex && modIndex > -1) {
			this.options.modules?.splice(modIndex, 1, [module, ...args]);
		} else {
			this.options.modules?.push([module, ...args]);
		}
	}
}
