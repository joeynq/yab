import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function DateTime(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "date-time" }), options);
}
