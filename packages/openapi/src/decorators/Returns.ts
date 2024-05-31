import type { TSchema } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import { type ContentType, type MediaType, routeStore } from "@vermi/router";
import { type Class } from "@vermi/utils";
import { SchemaKey } from "./Model";

export interface ReturnsOptions {
	contentType?: ContentType;
}

export const Returns = <T extends TSchema>(
	status: HttpCodes,
	model: Class<any> | T,
	options: ReturnsOptions = {},
) => {
	return (target: any, propertyKey: string | symbol) => {
		const store = routeStore.apply(target.constructor);
		const path = store.findPath(propertyKey);

		if (!path) {
			return;
		}

		store.updateRoute(path, (current) => {
			if (!current.responses) {
				current.responses = new Map();
			}

			const content =
				current.responses.get(status)?.content ||
				new Map<`${string}/${string}`, MediaType>();

			const schema =
				model instanceof Function ? (model as any)[SchemaKey] : model;

			content.set(options.contentType || "application/json", {
				schema,
			});

			current.responses.set(status, { content });

			return current;
		});
	};
};
