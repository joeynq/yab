import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function File(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "binary" }), options);
}

export { File as Binary };
