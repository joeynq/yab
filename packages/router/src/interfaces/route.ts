import type { TObject } from "@sinclair/typebox";
import type { Hooks } from "@yab/core";
import type { AnyClass, AnyFunction } from "@yab/utils";
import type { HttpMethod } from "../enums";
import type { RouterEvent, RouterEventMap } from "../event";

export type SlashedPath = `/${string}`;

export type RouterConfig = {
	middlewares?: AnyClass<any>[];
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
	hooks: Hooks<typeof RouterEvent, RouterEventMap>;
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
