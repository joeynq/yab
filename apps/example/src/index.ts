import { Entity, PrimaryKey } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { AuthModule, BearerAuth } from "@yab/auth";
import { CacheModule } from "@yab/cache";
import { RedisAdapter } from "@yab/cache/redis";
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
/*

new Yap()
	.use(DDDModule, {
		mount: "/api",
		domain: await import("@domain/users"), // inject user domain { entities, services, controllers }
		controllers: await import("@app/users/controllers"), // inject user controllers, only if not provided by domain
		repository: MikroOrmRepository,
	})

*/

new Yab()
	// yab is default to use ConsoleLogger
	.use(LoggerModule, { adapter: new PinoLogger() })
	.use(CacheModule, {
		adapter: new RedisAdapter({}),
	})
	.use(AuthModule, {
		strategy: new BearerAuth({
			options: {
				issuer: String(import.meta.env.ISSUER),
			},
		}),
	})
	.use(RouterModule, "/api", [UserController])
	.use(MikroOrmModule, {
		driver: PostgreSqlDriver,
		clientUrl: import.meta.env.DATABASE_URL,
		entities: [TestEntity],
	})
	.start((server) => console.log(`Server started at ${server.port}`));
