import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BearerAuth, auth } from "@vermi/auth";
import { cache } from "@vermi/cache";
import { SqliteAdapter } from "@vermi/cache/sqlite";
import { Vermi } from "@vermi/core";
import { PinoLogger } from "@vermi/logger/pino";
import { mikroOrm } from "@vermi/mikro-orm";
import { router } from "@vermi/router";
import { statics } from "@vermi/static";
import { UserController } from "./controllers";
import { User } from "./entities";

/*

new Vermi()
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

new Vermi()
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
