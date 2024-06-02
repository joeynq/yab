import type { TSchema } from "@sinclair/typebox";
import { useDecorators } from "@vermi/core";
import { type Class, isClass, pascalCase } from "@vermi/utils";
import { OnData as OrigOnData } from "@vermi/ws";
import { modelStore } from "../stores";

export function OnData(event: string, model?: Class<any> | TSchema) {
	let schema: TSchema | undefined = undefined;

	if (isClass(model)) {
		schema = modelStore.apply(model).getSchema(pascalCase(model.name));
	} else if (model) {
		schema = model;
	}
	return useDecorators(OrigOnData(event, schema));
}
