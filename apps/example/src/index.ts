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
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
