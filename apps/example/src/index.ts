import { Entity, EntityManager, PrimaryKey } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { AuthModule, BearerAuth } from "@yab/auth";
import { CacheModule } from "@yab/cache";
import { LruAdapter } from "@yab/cache/lru";
import { InjectContext, type LoggerAdapter, Yab } from "@yab/core";
import { LoggerModule } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import { MikroOrmModule } from "@yab/mikro-orm";
import { Action, Controller, HttpMethod, RouterModule } from "@yab/router";

@Controller("/users")
class UserController {
	@InjectContext("logger")
	logger!: LoggerAdapter;

	@Action(HttpMethod.GET, "/")
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

new Yab()
	// yab is default to use ConsoleLogger
	.use(LoggerModule, { adapter: new PinoLogger() })
	.use(CacheModule, {
		adapter: new LruAdapter({
			max: 100,
			ttl: 60 * 1000,
		}),
	})
	.use(AuthModule, {
		strategy: new BearerAuth({
			options: {
				issuer: "https://example.com",
			},
		}),
	})
	.use(RouterModule, "/api", [UserController])
	.use(MikroOrmModule, {
		driver: PostgreSqlDriver,
		clientUrl: "postgresql://postgresql:postgresql@localhost:5432/comichub",
		entities: [TestEntity],
	})
	.start((server) => console.log(`Server started at ${server.port}`));
