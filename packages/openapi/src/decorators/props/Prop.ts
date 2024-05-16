import { type TKind, type TSchema, Type } from "@sinclair/typebox";
import type { Class } from "@vermi/utils";
import { modelStore, propsStore } from "../../stores";
import { guessType } from "../../utils";

export type PropOptions<T extends TSchema> = Omit<T, keyof TKind> & {
	nullable?: boolean;
};

export function Prop<T extends TSchema>(
	options?: PropOptions<any>,
): (target: any, key: string | symbol) => void;

export function Prop<T extends TSchema>(
	type: () => T,
	options?: PropOptions<T>,
): (target: any, key: string | symbol) => void;

export function Prop<T extends TSchema>(
	type?: (() => T) | PropOptions<T>,
	options?: PropOptions<T>,
) {
	return (target: any, key: string | symbol) => {
		let opts: PropOptions<T> | undefined;
		let t: (() => T) | undefined;

		if (typeof type === "function") {
			t = type;
			opts = options;
		} else {
			opts = type;
		}

		const PropType = Reflect.getMetadata(
			"design:type",
			target,
			key,
		) as Class<any>;

		let T = t?.() ?? guessType(PropType);

		if (!T) {
			return;
		}

		opts && Object.assign(T, opts);

		if (opts?.nullable) {
			T = Type.Optional(T);
		}

		if (T.$id) {
			modelStore.apply(target.constructor).addSchema(T);
		}

		propsStore.apply(target.constructor).addProperty(key.toString(), T);
	};
}
