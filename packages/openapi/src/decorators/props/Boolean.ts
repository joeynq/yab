import { type TBoolean, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Boolean(options?: TBoolean & { nullable?: boolean }) {
	return Prop(() => Type.Boolean(), options);
}
