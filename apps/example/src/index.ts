import {
	Entity,
	type EntityManager,
	PostgreSqlDriver,
	PrimaryKey,
} from "@mikro-orm/postgresql";
import { Authorized, BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import { Logger, type LoggerAdapter, Yab } from "@yab/core";
import { logger } from "@yab/logger";
import { TsLogLogger } from "@yab/logger/tslog";
import { Em, mikroOrm } from "@yab/mikro-orm";
import { Controller, Get, router } from "@yab/router";
import { statics } from "@yab/static";

@Controller("/users")
class UserController {
	@Logger()
	logger!: LoggerAdapter;

	@Em()
	em!: EntityManager;

	@Authorized()
	@Get("/")
	getUsers() {
		this.logger.info("Get users");
		return { users: [] };
	}

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
	.use(logger(TsLogLogger))
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
