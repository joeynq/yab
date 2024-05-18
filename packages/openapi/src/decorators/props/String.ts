import { type StringOptions, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function String(options?: StringOptions & { nullable?: boolean }) {
	return Prop(() => Type.String(), options);
}
