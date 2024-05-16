import { Model } from "@vermi/openapi";
import pluralize from "pluralize";

export const SingularName = Symbol("SingularName");
export const PluralName = Symbol("PluralName");

export function Resource(name?: string) {
	return (target: any) => {
		const resourceName = name || target.name.toLowerCase();

		target.prototype[SingularName] = resourceName;
		target.prototype[PluralName] = pluralize(resourceName);
		Model({}, resourceName)(target);
	};
}
