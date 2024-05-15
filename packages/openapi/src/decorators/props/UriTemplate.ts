import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function UriTemplate(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "uri-template" }), options);
}
