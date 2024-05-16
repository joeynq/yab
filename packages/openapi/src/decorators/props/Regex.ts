import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Regex(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "regex" }), options);
}
