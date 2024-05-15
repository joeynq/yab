import { type TInteger, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function BigInt(options?: TInteger & { nullable?: boolean }) {
	return Prop(() => Type.Integer({ format: "int64" }), options);
}

export { BigInt as Long };
