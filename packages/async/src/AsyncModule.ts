import {
	AppHook,
	Config,
	Configuration,
	Module,
	type VermiModule,
} from "@vermi/core";

export class AsyncModuleConfig {
	// Add configuration options here
}

@Module()
export class AsyncModule implements VermiModule<AsyncModuleConfig> {
	@Config() public config!: AsyncModuleConfig;

	constructor(protected configuration: Configuration) {}

	@AppHook("app:init")
	public async init() {
		// Add initialization logic here
	}
}
