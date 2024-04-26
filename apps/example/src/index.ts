import { Yab } from "@yab/core";
import { LoggerModule } from "@yab/logger";
import { Action, Controller, HttpMethod, RouterModule } from "@yab/router";

@Controller("/users")
class UserController {
	@Action(HttpMethod.GET, "/")
	getUsers() {
		return { users: [] };
	}
}

new Yab()
	.use(LoggerModule, { pino: {} })
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
