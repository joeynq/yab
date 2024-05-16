import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function IdnHostname(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "idn-hostname" }), options);
}
