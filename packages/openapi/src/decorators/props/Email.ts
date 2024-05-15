import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Email(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "email" }), options);
}
