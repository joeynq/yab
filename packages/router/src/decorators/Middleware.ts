import { InjectOn, Injectable, useDecorators } from "@vermi/core";

export const Middleware = () => {
	return useDecorators(InjectOn("router:init"), Injectable("SCOPED"));
};
