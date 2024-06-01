import { BearerAuth, auth } from "@vermi/auth";
import { cache } from "@vermi/cache";
import { SqliteAdapter } from "@vermi/cache/sqlite";
import {
	type LogLevel,
	type LogOptions,
	type LoggerAdapter,
	Vermi,
} from "@vermi/core";
import { openapi } from "@vermi/openapi";
import { router } from "@vermi/router";
import { statics } from "@vermi/static";
import { JsonParser, ws } from "@vermi/ws";
import { UserController } from "./controllers";
import { TestSocket } from "./sockets/TestSocket";

/*

new Vermi()
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

const logOptions: LogOptions = {
	level: import.meta.env.LOG_LEVEL as LogLevel,
	options: {
		formatDate: (date) => {
			date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
			return date.toISOString().split("T")[1].split("Z")[0];
		},
	},
};

new Vermi({
	log: logOptions,
})
	// SqliteAdapter recommended for development.
	// RedisAdapter is recommended for production.
	.use(cache(SqliteAdapter, {}))
	.use(
		auth(BearerAuth, {
			config: {
				options: {
					issuer: String(import.meta.env.ISSUER),
				},
			},
		}),
	)
	.use(statics("/public", { assetsDir: "./public" }))
	.use(statics("/favicon.ico", { assetsDir: "./public", direct: true }))
	// .use(rateLimit("redis", {}))
	.use(ws({ path: "/ws", eventStores: [TestSocket], parser: JsonParser }))
	.use(
		router("/api", [UserController], {
			casing: { internal: "camel", interfaces: "snake" },
		}),
	)
	.use(
		openapi("/docs", {
			prefix: "/api",
			specs: { security: [{ BearerAuth: [] }] },
			features: {
				rateLimit: true,
				cors: true,
			},
		}),
	)
	.start((context, { port }) => {
		context.resolve<LoggerAdapter>("logger")?.info(`Server started at ${port}`);
	});
