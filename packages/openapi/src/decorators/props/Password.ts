import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Password(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "password" }), options);
}
