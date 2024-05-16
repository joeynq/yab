import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function IdnEmail(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "idn-email" }), options);
}
