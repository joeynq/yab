import { type TNull, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Null(options?: TNull & { nullable?: boolean }) {
	return Prop(() => Type.Null(), options);
}
