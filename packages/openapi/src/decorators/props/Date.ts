import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Date(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "date" }), options);
}
