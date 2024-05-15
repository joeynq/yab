import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Iri(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "iri" }), options);
}
