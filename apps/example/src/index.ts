import { AuthModule } from "@yab/auth";
import { CacheModule } from "@yab/cache";
import { LruAdapter } from "@yab/cache/lru";
import { Yab } from "@yab/core";
import { LoggerModule } from "@yab/logger";
import { PinoLogger } from "@yab/logger/pino";
import { Action, Controller, HttpMethod, RouterModule } from "@yab/router";

@Controller("/users")
class UserController {
	@Action(HttpMethod.GET, "/")
	getUsers() {
		return { users: [] };
	}
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
		authOptions: {
			issuer: "https://example.com",
		},
	})
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
