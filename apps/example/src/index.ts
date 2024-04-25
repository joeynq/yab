import { Injectable, Yab } from "@yab/core";
import { RouterModule } from "@yab/router";

@Injectable()
class UserController {}

new Yab()
	.use(RouterModule, "/api", [UserController])
	.start((server) => console.log(`Server started at ${server.port}`));
