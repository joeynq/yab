import { type ArrayOptions, type TSchema, Type } from "@sinclair/typebox";
import { propsStore } from "../../stores";

export const Array = <T extends TSchema>(
	options?: ArrayOptions & { nullable?: boolean },
) => {
	const nullable = options?.nullable;
	if (options) {
		// biome-ignore lint/performance/noDelete: <explanation>
		delete options.nullable;
	}
	return {
		Of(type: () => T, propOpts?: T) {
			return (target: any, key: string) => {
				const single = type();

				if (propOpts) {
					Object.assign(single, propOpts);
				}

				let typeArr = Type.Array(single, options);
				if (nullable) {
					typeArr = Type.Optional(typeArr);
				}

				propsStore.apply(target.constructor).addProperty(key, typeArr);
			};
		},

		OneOf(types: (() => T)[]) {
			return (target: any, key: string) => {
				const oneOf = types.map((type) => type());
				let typeArr = Type.Array(Type.Union(oneOf), options);
				if (nullable) {
					typeArr = Type.Optional(typeArr);
				}

				propsStore.apply(target.constructor).addProperty(key, typeArr);
			};
		},
	};
};
