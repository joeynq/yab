import { Yab } from "@yab/core";
import { RouterModule } from "@yab/router";

new Yab()
	.use(RouterModule, "/api", [])
	.start((server) => console.log(`Server started at ${server.port}`));
