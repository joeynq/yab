import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function String(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String(), options);
}
