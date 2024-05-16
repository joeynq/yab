import { type IntegerOptions, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Integer(options?: IntegerOptions & { nullable?: boolean }) {
	return Prop(() => Type.Integer({ format: "int32" }), options);
}
