import type { TSchema } from "@sinclair/typebox";
import type { Class, MaybePromiseFunction } from "@vermi/utils";
import type { FindResult } from "memoirist";
import type { Operation, SlashedPath } from "./schema";

export type RouterConfig = {
	middlewares?: Class<any>[];
	customValidation?: ValidationFn;
	errorHandler?: (error: Error, responses?: Operation["responses"]) => Response;
	responseHandler?: <T>(
		result: T,
		responses?: Operation["responses"],
	) => Response;
	routes: { [key: SlashedPath]: Operation[] };
};

export interface RouteMatch extends Omit<Operation, "handler"> {
	handler: MaybePromiseFunction;
	path: string;
}

export type ValidationFn = <Schema extends TSchema, T extends Readonly<any>>(
	schema: Schema,
	value: T,
	route: FindResult<RouteMatch>,
) => Promise<void>;
