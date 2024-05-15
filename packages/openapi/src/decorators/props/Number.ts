import { type TNumber, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Number(options?: TNumber & { nullable?: boolean }) {
	return Prop(() => Type.Number(), options);
}
