import { type TNumber, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Float(options?: TNumber & { nullable?: boolean }) {
	return Prop(() => Type.Number({ format: "float" }), options);
}
