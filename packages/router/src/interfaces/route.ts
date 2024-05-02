import type { TObject, TSchema } from "@sinclair/typebox";
import type { Hooks } from "@yab/core";
import type { AnyClass, AnyFunction } from "@yab/utils";
import type { HttpMethod } from "../enums";

export type SlashedPath = `/${string}`;

export type ParameterType = "query" | "params" | "body" | "headers";

export type RouteParameter = {
	index: number;
	schema?: TObject;
	in: ParameterType;
};

export type ValidationMetadata = {
	schema?: TObject;
};

export type RouterConfig = {
	middlewares?: AnyClass<any>[];
	customValidation?: (schema: TSchema, payload: unknown) => Promise<void>;
	errorHandler?: (
		error: Error,
		responseConfig?: RouteObject["response"],
	) => Response;
	responseHandler?: <T>(
		result: T,
		responseConfig?: RouteObject["response"],
	) => Response;
	routes: { [key: SlashedPath]: RouteObject[] };
};

export type RouteObject = {
	prefix: SlashedPath;
	method: HttpMethod;
	path: string;
	controller: AnyClass<any>;
	actionName: string;
	middlewares?: AnyClass<any>[];
	parameters?: RouteParameter[];
	payload?: {
		query?: TObject;
		body?: TObject;
		params?: TObject;
		headers?: TObject;
	};
	response?: {
		[statusCode: number]: {
			contentType: string;
			schema: TObject;
		};
	};
};

export type ControllerMetadata = {
	prefix: SlashedPath;
	controller: AnyClass<any>;
	routes: {
		[action: string]: RouteMetadata;
	};
};

// separate route metadata and route object
export type RouteMetadata = {
	method: HttpMethod;
	path: string;
	parameters?: RouteParameter[];
	payload?: {
		query?: TObject;
		body?: TObject;
		params?: TObject;
		headers?: TObject;
	};
	response?: {
		[statusCode: number]: {
			contentType: string;
			schema: TObject;
		};
	};
	middlewares?: AnyClass<any>[];
};

export type RouteMatch = {
	handler: AnyFunction;
	hooks: Hooks<{ [key: string]: string }, any>;
	path: string;
	payload?: {
		query?: TObject;
		body?: TObject;
		params?: TObject;
		headers?: TObject;
	};
	parameters?: RouteParameter[];
	route: RouteObject;
	response?: {
		[statusCode: number]: {
			contentType: string;
			schema: TObject;
		};
	};
};
