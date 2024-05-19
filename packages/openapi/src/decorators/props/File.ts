import type { StringOptions } from "@sinclair/typebox";
import { limitSettings } from "../../settings/values";
import { String } from "./String";

export function File(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "binary",
		maxLength: limitSettings.maxFileLength,
	});
}

export { File as Binary };
