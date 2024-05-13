import type { TSchema } from "@sinclair/typebox";
import type { HttpCodes } from "@vermi/core";
import type { Class } from "@vermi/utils";
import type { HttpMethod } from "../enums";
import type { Mapper } from "../services";

export type ContentType = `${string}/${string}`;

export type SlashedPath = `/${string}`;

export type FullPath = `${HttpMethod}${SlashedPath}`;

export interface Handler {
	target: Class<any>;
	action: string;
}

interface WithSchema {
	schema: TSchema;
	required?: boolean;
}

interface MediaType extends WithSchema {
	mediaType?: string;
}

interface Response {
	content: Map<ContentType, MediaType>;
	headers?: Map<string, WithSchema>;
}

interface CommonArg extends WithSchema {
	index: number;
	pipes?: Class<Mapper<any, any>>[];
}

export interface Parameter extends CommonArg {
	in: "path" | "query" | "header" | "cookie";
}

export interface RequestBody extends CommonArg {
	in: "body";
	contentType?: ContentType;
}

export interface Operation {
	responses?: Map<HttpCodes, Response>;
	security?: Map<string, string[]>;
	handler: Handler;
	args?: (Parameter | RequestBody)[];
}

export interface Routes {
	paths: Map<FullPath, Operation>;
	webhooks?: Map<FullPath, Operation>;
	security?: Map<string, string[]>;
}
