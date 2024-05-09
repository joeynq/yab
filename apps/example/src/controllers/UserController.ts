import type { EntityManager } from "@mikro-orm/core";
import { Logger, type LoggerAdapter } from "@yab/core";
import { Em } from "@yab/mikro-orm";
import { Body, Controller, Get, Params, Post, Query, Use } from "@yab/router";
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
	logger!: LoggerAdapter;

	@Em()
	em!: EntityManager;

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
	// @Authorized()
	@Get("/:id")
	getUser(
		@Query(UserQuerySchema) userQuery: UserQuerySchemaDto,
		@Params(UserParamSchema) param: UserParamDto,
	) {
		this.logger.info("Get user");
		return {
			user: {
				userQuery,
				param,
			},
		};
	}
}
