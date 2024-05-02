import { Entity, PrimaryKey } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BearerAuth, auth } from "@yab/auth";
import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import {
	type Context,
	InjectContext,
	Injectable,
	type LoggerAdapter,
	Yab,
} from "@yab/core";
import { logger } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import { mikroOrm } from "@yab/mikro-orm";
// import { notification } from "@yab/notification";
import {
	AfterRoute,
	BeforeRoute,
	Controller,
	Get,
	Use,
	router,
} from "@yab/router";
// import { cors, helmet } from "@yab/security";
import { statics } from "@yab/static";
import { yoga } from "@yab/yoga";

@Injectable()
class AnyMiddleware {
	@InjectContext("logger")
	logger!: LoggerAdapter;

	@BeforeRoute()
	public test(_: Context) {
		this.logger.info(`Before route ${_.request.url}`);
	}

	@AfterRoute()
	public test3(_: Context) {
		this.logger.info(`After route ${_.request.url}`);
	}
}

@Controller("/users")
class UserController {
	@InjectContext("logger")
	logger!: LoggerAdapter;

	@Use(AnyMiddleware)
	@Get("/")
	getUsers() {
		this.logger.info("Getting users");
		return { users: [] };
	}
}

@Entity()
class TestEntity {
	@PrimaryKey()
	id!: string;
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
	.use(logger(PinoLogger))
	// .use(cors())
	// .use(helmet())
	.use(cache({}, SqliteAdapter))
	.use(
		auth(BearerAuth, {
			options: { issuer: String(import.meta.env.ISSUER) },
		}),
	)
	.use(
		mikroOrm({
			driver: PostgreSqlDriver,
			clientUrl: import.meta.env.DATABASE_URL,
			entities: [TestEntity],
		}),
	)
	.use(statics("/public", { assetsDir: "./public" }))
	.use(yoga("/graphql", {}))
	.use(router("/api", [UserController]))
	// .use(notification({ email: {} }, {}))
	.start((server) => console.log(`Server started at ${server.port}`));
