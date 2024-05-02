import {
	Entity,
	type EntityManager,
	PrimaryKey,
	type RequestContext,
} from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import { Logger, type LoggerAdapter, Yab } from "@yab/core";
import { PinoLogger } from "@yab/logger/pino";
import { Em, mikroOrm } from "@yab/mikro-orm";
import {
	AfterRoute,
	BeforeRoute,
	Body,
	Controller,
	Get,
	Params,
	Post,
	Query,
	Use,
	router,
} from "@yab/router";
import { statics } from "@yab/static";
import {
	type UserParamDto,
	UserParamSchema,
	UserQuerySchema,
	type UserQuerySchemaDto,
} from "./models";

class AnyMiddleware {
	@BeforeRoute()
	public test(ctx: RequestContext) {}

	@AfterRoute()
	public test3(ctx: RequestContext) {}
}

@Controller("/users")
class UserController {
	@Logger()
	logger!: LoggerAdapter;

	@Em()
	em!: EntityManager;

	@Post("/")
	createUser(@Body(UserQuerySchema) user: UserQuerySchemaDto) {
		this.logger.info("Create users");
		return { user };
	}

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

@Entity()
class User {
	@PrimaryKey()
	id!: number;
}

/*

new Yab()
	.use(DDDModule, {
		mount: "/api",
		domain: await import("@domain/users"), // inject user domain { entities, services, controllers }
		controllers: await import("@app/users/controllers"), // inject user controllers, only if not provided by domain
		repository: MikroOrmRepository,
	})
*/

if (import.meta.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

new Yab()
	.logger(PinoLogger)
	// SqliteAdapter recommended for development.
	// RedisAdapter is recommended for production.
	.use(cache({}, SqliteAdapter))
	.use(
		auth(BearerAuth, {
			options: {
				issuer: String(import.meta.env.ISSUER),
			},
		}),
	)
	.use(
		mikroOrm({
			clientUrl: String(import.meta.env.DATABASE_URL),
			driver: PostgreSqlDriver,
			entities: [User],
		}),
	)
	.use(statics("/public", { assetsDir: "./public" }))
	// .use(rateLimit("redis", {}))
	.use(
		router("/api", [UserController], {
			customValidation: async (schema: any, payload: any) => {},
			middlewares: [AnyMiddleware],
		}),
	)
	.start((context, { port }) => {
		context.store.logger.info(`Server started at ${port}`);
	});
