import { cache } from "@vermi/cache";
import { SqliteAdapter } from "@vermi/cache/sqlite";
import { Module, UseModule, VermiModule } from "@vermi/core";
import { router } from "@vermi/router";
import { UserController } from "./controllers";

@Module()
@UseModule(
	router("/api", [UserController], {
		casing: { internal: "camel", interfaces: "snake" },
	}),
)
@UseModule(cache(SqliteAdapter, {}))
export class AppModule extends VermiModule<{}> {}
