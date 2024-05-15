import { type ObjectOptions, type TSchema, Type } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { type PropsStoreDto, propsStore } from "../stores";
import { Model } from "./Model";
import { Prop } from "./props";

export const GenericModel = (options?: ObjectOptions) => {
	return useDecorators(Model(options), (target: any) => {
		const props = propsStore.apply(target).get();
		const genericKeys: Array<{ key: string; isArray: boolean }> =
			Reflect.getMetadata("generic:keys", target) || [];

		const genericBuilder = <T extends TSchema>(T: T, name: string) => {
			const propsWithGenerics = Object.entries(props).reduce(
				(acc, [key, value]) => {
					const genericKey = genericKeys.find((k) => k.key === key);

					if (genericKey) {
						const { isArray } = genericKey;
						const ref = T.$id ? Type.Ref(T) : T;
						const generic = isArray ? Type.Array(ref) : ref;
						acc[key] = generic;
					} else {
						acc[key] = value;
					}
					return acc;
				},
				{} as PropsStoreDto,
			);
			return Type.Object(propsWithGenerics, {
				...options,
				$id: `#/components/schemas/${name}`,
			});
		};

		Reflect.defineMetadata("generic:builder", genericBuilder, target);
	});
};

export const Of = () => {
	return useDecorators<PropertyDecorator>(
		Prop(Type.Any()),
		(target: any, key: string | symbol) => {
			const type = Reflect.getMetadata("design:type", target, key);

			const isArray = type === Array;

			const genericKeys: Array<{ key: string; isArray: boolean }> =
				Reflect.getMetadata("generic:keys", target) || [];

			if (genericKeys.some((k) => k.key === key)) {
				return;
			}

			Reflect.defineMetadata(
				"generic:keys",
				[...genericKeys, { key, isArray }],
				target.constructor,
			);
		},
	);
};

/*

@Generics("T")
class Pagination<T> {
  @OfArray("T")
  data: T[];

  @Of("T")
  item: T;
}

function Generic<M, T>(model: M, type: T) {
  return Type.Object(type).data(model)
}

function Pagination(model: User) {
  return Type.Object(User)
}

*/
