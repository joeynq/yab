import type { Configuration } from "./Configuration";

export abstract class VermiModule<Options> {
	protected abstract configuration: Configuration;

	protected get config(): Options {
		return this.getConfig();
	}

	protected getConfig(): Options {
		return (
			this.configuration.getModuleConfig<Options>(this.constructor.name)
				?.config ?? ({} as Options)
		);
	}
}
