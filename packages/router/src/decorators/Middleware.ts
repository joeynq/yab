import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";

export interface MiddlewareOptions {
	deps?: Class<any>[];
}

export const Middleware = ({ deps = [] }: MiddlewareOptions = {}) => {
	return useDecorators(Injectable("SCOPED"), Deps(...deps));
};
