import { cache } from "@yab/cache";
import { SqliteAdapter } from "@yab/cache/sqlite";
import {
	type Context,
	InjectContext,
	type LoggerAdapter,
	Yab,
} from "@yab/core";
import { logger } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import {
	AfterRoute,
	BeforeRoute,
	Controller,
	Get,
	Use,
	router,
} from "@yab/router";
import { statics } from "@yab/static";

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
	.use(cache({}, SqliteAdapter))
	.use(statics("/public", { assetsDir: "./public" }))
	.use(router("/api", [UserController]))
	.start((server, { logger }) =>
		logger.info(`Server started at ${server.port}`),
	);
