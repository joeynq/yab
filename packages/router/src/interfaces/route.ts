import type { TSchema } from "@sinclair/typebox";
import type { HTTPMethod, Matched } from "@vermi/find-my-way";
import type { Class, MaybePromiseFunction } from "@vermi/utils";
import type { Operation, SlashedPath } from "./schema";

export type { HTTPMethod };

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
	method: HTTPMethod;
}

export type ValidationFn = <Schema extends TSchema, T extends Readonly<any>>(
	schema: Schema,
	value: T,
	route: Matched<RouteMatch>,
) => Promise<void>;
