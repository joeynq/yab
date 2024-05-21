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

export type ExtractParams<Path> = Path extends "card/:cardId"
	? { cardId: string }
	: // biome-ignore lint/complexity/noBannedTypes: <explanation>
		{};

export * from "change-case";
