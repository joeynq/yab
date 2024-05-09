import type { TObject } from "@sinclair/typebox";
import type { AnyClass, MaybePromiseFunction } from "@yab/utils";
import type { FindResult } from "memoirist";
import type { HttpMethod } from "../enums";

export type SlashedPath = `/${string}`;

export type ParameterType = "query" | "params" | "body" | "headers" | "cookie";

export type RouteParameter = {
	index: number;
	schema?: TObject;
	in: ParameterType;
};

export type RouterConfig = {
	middlewares?: AnyClass<any>[];
	customValidation?: ValidationFn;
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

interface Route {
	path: string;
	parameters?: RouteParameter[];
	response?: {
		[statusCode: number]: {
			contentType: string;
			schema: TObject;
		};
	};
}

export interface RouteObject extends Route {
	prefix: SlashedPath;
	method: HttpMethod;
	controller: AnyClass<any>;
	actionName: string;
	middlewares?: AnyClass<any>[];
}

export type ControllerMetadata = {
	prefix: SlashedPath;
	controller: AnyClass<any>;
	routes: {
		[action: string]: RouteMetadata;
	};
};

// separate route metadata and route object
export interface RouteMetadata extends Route {
	method: HttpMethod;
	middlewares?: AnyClass<any>[];
}

export interface RouteMatch extends Route {
	handler: MaybePromiseFunction;
	prefix: SlashedPath;
}

export type ValidationFn = <Schema extends TObject, T extends Readonly<any>>(
	schema: Schema,
	value: T,
	route: FindResult<RouteMatch>,
) => Promise<void>;
