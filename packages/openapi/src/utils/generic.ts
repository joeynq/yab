import type { TSchema } from "@sinclair/typebox";
import { saveStoreData } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { SchemaKey } from "../decorators";
import { ModelStoreKey } from "../stores";

export type GenericBuilder = <T extends TSchema>(T: T, name: string) => TSchema;

export const generic = (model: Class<any>) => {
	const genericBuilder = Reflect.getMetadata(
		"generic:builder",
		model,
	) as GenericBuilder;
	return {
		of(type: Class<any>) {
			const T = (type as any)[SchemaKey] as TSchema;

			const typeName = T.$id?.split("/").pop();

			const name = `${model.name}Of${typeName || type.name}`;
			const schema = genericBuilder(T, name);

			saveStoreData(ModelStoreKey, [schema, T]);

			return schema;
		},
	};
};
