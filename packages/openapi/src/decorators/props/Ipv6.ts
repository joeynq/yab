import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Ipv6(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "ipv6" }), options);
}
