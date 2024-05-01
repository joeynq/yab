import type { TObject } from "@sinclair/typebox";
import type { Hooks } from "@yab/core";
import type { AnyClass } from "@yab/utils";
import type { HttpMethod } from "../enums";
import type { RouterEvent, RouterEventMap } from "../event";

export type SlashedPath = `/${string}`;

export type RouterConfig = {
	[key: SlashedPath]: RouteObject[];
};

export type RouteObject = {
	prefix: SlashedPath;
	method: HttpMethod;
	path: string;
	controller: AnyClass<any>;
	actionName: string;
	hook: Hooks<typeof RouterEvent, RouterEventMap>;
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
	hook?: Hooks<typeof RouterEvent, RouterEventMap>;
};
