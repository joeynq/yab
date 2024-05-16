import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Pattern(
	pattern: RegExp | string,
	options?: TString & { nullable?: boolean },
) {
	return Prop(
		() =>
			Type.String({
				pattern: typeof pattern === "string" ? pattern : pattern.source,
			}),
		options,
	);
}
