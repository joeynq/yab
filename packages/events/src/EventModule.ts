import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	VermiModule,
	asValue,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { Transporter } from "./interfaces";

declare module "@vermi/core" {
	interface _AppContext {
		transporter: Transporter;
	}
}

export interface AsyncModuleConfig<T extends Transporter> {
	name?: string;
	transporter: Class<T>;
	options: ConstructorParameters<Class<T>>[0];
}

@Module()
export class AsyncModule extends VermiModule<AsyncModuleConfig<Transporter>[]> {
	@Config() public config!: AsyncModuleConfig<Transporter>[];

	constructor(protected configuration: Configuration) {
		super();
	}

	@AppHook("app:init")
	public async init(context: AppContext) {
		for (const { transporter, options, name } of this.config) {
			const registeredName = `transporter.${name || transporter.name}`;
			context.register(registeredName, asValue(new transporter(options)));
		}
	}
}
