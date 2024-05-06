import {
	Entity,
	type EntityManager,
	PostgreSqlDriver,
	PrimaryKey,
} from "@mikro-orm/postgresql";
import { BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import {
	Logger,
	type LoggerAdapter,
	type RequestContext,
	Yab,
} from "@yab/core";
import { Em, mikroOrm } from "@yab/mikro-orm";
import {
	AfterRoute,
	BeforeRoute,
	Controller,
	Get,
	Middleware,
	Use,
	router,
} from "@yab/router";
import { statics } from "@yab/static";

@Middleware()
class AnyMiddleware {
	@Logger()
	logger!: LoggerAdapter;

	@BeforeRoute()
	public test(ctx: RequestContext) {
		this.logger.info(`Before route ${ctx.store.requestId}`);
	}

	@AfterRoute()
	public test3(ctx: RequestContext) {
		this.logger.info(`After route ${ctx.store.requestId}`);
	}
}

@Controller("/users")
class UserController {
	@Logger()
	logger!: LoggerAdapter;

	@Em()
	em!: EntityManager;

	@Use(AnyMiddleware)
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

new Yab({ port: 5000 })
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
