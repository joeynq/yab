import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function IriReference(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "iri-reference" }), options);
}
