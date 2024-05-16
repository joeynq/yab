import { type TInteger, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Integer(options?: TInteger & { nullable?: boolean }) {
	return Prop(() => Type.Integer({ format: "int32" }), options);
}
