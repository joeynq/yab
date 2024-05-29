import { Deps, Injectable, useDecorators } from "@vermi/core";
import type { Class } from "@vermi/utils";

export interface InterceptorOptions {
	deps?: Class<any>[];
}

export const Interceptor = ({ deps = [] }: InterceptorOptions = {}) => {
	return useDecorators(Injectable("SCOPED"), Deps(...deps));
};
