import { camelCase } from "@vermi/utils";
import { containerRef } from "../services";

export function InterceptOptions(): PropertyDecorator {
	return (target, propertyKey) => {
		Object.defineProperty(target, propertyKey, {
			get() {
				const name = `${camelCase(target.constructor.name)}.options`;
				const has = containerRef().hasRegistration(name);
				if (!has) {
					return undefined;
				}
				return containerRef().resolve(name);
			},
			configurable: true,
		});
	};
}
