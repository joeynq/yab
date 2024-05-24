import { deburr } from "./internal/deburr";
import { getVal } from "./object";

export const uuid = () => {
	return crypto.randomUUID();
};

export const format = <O extends object>(
	str: string,
	obj: O,
	skipEmpty = false,
) => {
	return str.replace(/{([^}]+)}/g, (_, key) => {
		return String(getVal(obj, key, skipEmpty ? `{${key}}` : ""));
	});
};

export function slugify(text: string, separator = "-") {
	return deburr(text.normalize("NFKD"))
		.toLowerCase() // Convert the string to lowercase letters
		.replace(/[^\w-]+/g, " ") // Remove all non-word chars
		.trim() // Trim leading/trailing spaces
		.replace(/\s+/g, separator) // Replace spaces with -
		.replace(/--+/g, separator); // Replace multiple - with single -
}

// e.g. "/sad/:cardId/ses/:userId/sss" --> { cardId: string, userId: string }
export type ExtractParams<T extends string> =
	T extends `${string}:${infer P}/${infer R}`
		? { [K in P]: string } & ExtractParams<R>
		: T extends `${string}:${infer P}`
			? { [K in P]: string }
			: // biome-ignore lint/complexity/noBannedTypes: <explanation>
				{};

export * from "change-case";
