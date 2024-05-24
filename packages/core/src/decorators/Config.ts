import { containerRef } from "../services";

export const Config = (moduleName?: string): PropertyDecorator => {
	return (target: any, key: string | symbol) => {
		Object.defineProperty(target, key, {
			get: () => {
				const name = moduleName || target.constructor.name;
				return containerRef().resolve(name);
			},
			configurable: true,
		});
	};
};
