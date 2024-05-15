// import type { EntityManager } from "@mikro-orm/core";
import { Logger, type LoggerAdapter } from "@vermi/core";
import { Body, Controller, Get, Params, Post, Query, Use } from "@vermi/router";
import { AnyMiddleware } from "../middlewares";
import {
	type UserParamDto,
	UserParamSchema,
	UserQuerySchema,
	type UserQuerySchemaDto,
} from "../models";

@Controller("/users")
export class UserController {
	@Logger()
	public logger!: LoggerAdapter;

	@Post("/")
	createUser(@Body(UserQuerySchema) user: UserQuerySchemaDto) {
		this.logger.info("Create users");
		return { user };
	}

	@Use(AnyMiddleware)
	@Get("/")
	getUsers() {
		this.logger.info("Get users");
		return { users: [] };
	}

	@Use(AnyMiddleware)
	@Get("/:id")
	getUser(
		@Query(UserQuerySchema) userQuery: UserQuerySchemaDto,
		@Params(UserParamSchema) param: UserParamDto,
	) {
		this.logger.info(param);
		return {
			user: {
				query: userQuery,
				param,
			},
		};
	}
}
