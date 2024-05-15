import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function UriReference(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "uri-reference" }), options);
}
