import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import { Yab } from "@yab/core";
import { PinoLogger } from "@yab/logger/pino";
import { mikroOrm } from "@yab/mikro-orm";
import { router } from "@yab/router";
import { statics } from "@yab/static";
import { UserController } from "./controllers";
import { User } from "./entities";

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
			// customValidation: async (schema: any, payload: any) => {},
			// middlewares: [AnyMiddleware],
		}),
	)
	.start((context, { port }) => {
		context.store.logger.info(`Server started at ${port}`);
	});
