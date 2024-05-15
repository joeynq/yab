import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Time(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "time" }), options);
}
