import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Ipv4(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "ipv4" }), options);
}
