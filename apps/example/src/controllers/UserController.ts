import { Authorized } from "@vermi/auth";
import { Logger, type LoggerAdapter } from "@vermi/core";
import { Responses, generic } from "@vermi/openapi";
import { Controller, Post } from "@vermi/router";
import { Pagination, User } from "../models";

// const schema = classStore.apply(UserQuery).get();

@Controller("/users")
export class UserController {
	@Logger()
	public logger!: LoggerAdapter;

	@Authorized()
	@Responses(200, generic(Pagination).of(User))
	@Post("/:id")
	getUser() {
		// this.logger.info(param);
		// return {
		// 	user: {
		// 		query: userQuery,
		// 		param,
		// 	},
		// };
	}
}
