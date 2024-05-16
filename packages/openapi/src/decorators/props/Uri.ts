import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Uri(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "uri" }), options);
}