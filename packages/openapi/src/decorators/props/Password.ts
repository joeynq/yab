import { type StringOptions, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings/values";
import { AllOf } from "./AllOf";

export function Password(
	patterns: (string | RegExp)[],
	options?: StringOptions & { nullable?: boolean },
) {
	const { nullable, ...rest } = options || {};
	const patternStrings = patterns.map((pattern) => {
		if (pattern instanceof RegExp) {
			return pattern.source;
		}
		return pattern;
	});
	return AllOf(
		patternStrings.map((pattern) =>
			Type.String({
				pattern,
				format: "password",
				...rest,
				maxLength: limitSettings.passwordMaxLength,
				minLength: limitSettings.passwordMinLength,
			}),
		),
		{ nullable },
	);
}
