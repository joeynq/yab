import { useDecorators } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { Post } from "@vermi/router";
import type { Class } from "@vermi/utils";
import { Single } from "../models";

export function Create(resource: Class<any>) {
	return useDecorators(Post("/"), Responses(201, generic(Single).of(resource)));
}
