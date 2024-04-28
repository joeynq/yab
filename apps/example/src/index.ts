import { AuthModule } from "@yab/auth";
import { CacheModule } from "@yab/cache";
import { LruAdapter } from "@yab/cache/lru";
import { Yab } from "@yab/core";
import { LoggerModule } from "@yab/logger";
import { pinoLogger } from "@yab/logger/loggers";
import { Action, Controller, HttpMethod, RouterModule } from "@yab/router";

@Controller("/users")
class UserController {
	@Action(HttpMethod.GET, "/")
	getUsers() {
		return { users: [] };
	}
}

new Yab()
	.use(LoggerModule, {
		logger: pinoLogger.createLogger(),
		createChild: pinoLogger.createChild,
	})
	.use(CacheModule, {
		adapter: LruAdapter,
		options: {
			max: 100,
			maxAge: 1000 * 60 * 60,
		},
	})
	.use(AuthModule, {
		authOptions: {
			issuer: "https://example.com",
		},
	})
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
