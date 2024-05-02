import { Entity, PrimaryKey } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { AuthModule, BearerAuth } from "@yab/auth";
import { CacheModule } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import {
	type Context,
	InjectContext,
	Injectable,
	type LoggerAdapter,
	Yab,
} from "@yab/core";
import { LoggerModule } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import { MikroOrmModule } from "@yab/mikro-orm";
import {
	AfterRoute,
	BeforeRoute,
	Controller,
	Get,
	RouterModule,
	Use,
} from "@yab/router";
import { StaticModule } from "@yab/static";

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
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

new Yab({ port: 5000 })
	.use(LoggerModule, { adapter: new PinoLogger() })
	.use(CacheModule, {
		adapter: new SqliteAdapter(),
	})
	.use(AuthModule, {
		strategy: new BearerAuth({
			options: {
				issuer: String(import.meta.env.ISSUER),
			},
		}),
	})
	.use(MikroOrmModule, {
		driver: PostgreSqlDriver,
		clientUrl: import.meta.env.DATABASE_URL,
		entities: [TestEntity],
	})
	.use(StaticModule, { prefix: "/public", assetsDir: "./public" })
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
