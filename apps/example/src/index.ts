import { Entity, type EntityManager, PrimaryKey } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Authorized, BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import { Logger, type LoggerAdapter, Yab } from "@yab/core";
import { logger } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import { Em, mikroOrm } from "@yab/mikro-orm";
import { Controller, Get, router } from "@yab/router";
import { statics } from "@yab/static";

@Controller("/users")
class UserController {
	@Logger()
	logger!: LoggerAdapter;

	@Em()
	em!: EntityManager;

	@Get("/")
	getUsers() {
		this.logger.info("Get users");
		return { users: [] };
	}

	@Authorized()
	@Get("/:id")
	getUser() {
		this.logger.info("Get user");
		return { user: {} };
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
	// PinoLogger is recommended.
	.use(logger(PinoLogger))
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
	.use(router("/api", [UserController]))
	.start((context, { port }) => {
		context.store.logger.info(`Server started at ${port}`);
	});
