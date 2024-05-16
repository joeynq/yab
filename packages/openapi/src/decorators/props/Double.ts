import { type TNumber, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Double(options?: TNumber & { nullable?: boolean }) {
	return Prop(() => Type.Number({ format: "double" }), options);
}
