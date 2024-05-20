import { Authorized } from "@vermi/auth";
import { Logger, type LoggerAdapter } from "@vermi/core";
import { Query } from "@vermi/openapi";
import {
	Create,
	Delete,
	Read,
	RestController,
	Result,
	Update,
} from "@vermi/restapi";
import { UserDTO, UserSearch } from "../models";

@RestController(UserDTO)
export class UserController {
	@Logger()
	public logger!: LoggerAdapter;

	@Authorized("BearerAuth")
	@Read(UserDTO)
	getUser() {
		return Result.single(new UserDTO());
	}

	// @Authorized("BearerAuth")
	@Read([UserDTO])
	getUsers(@Query({ nullable: true }) search: UserSearch) {
		return Result.multiple([search]);
	}

	@Authorized("BearerAuth")
	@Create(UserDTO)
	createUser() {
		return Result.single(new UserDTO());
	}

	@Authorized("BearerAuth")
	@Update(UserDTO)
	updateUser() {
		return Result.single(new UserDTO());
	}

	@Authorized("BearerAuth")
	@Delete(UserDTO)
	deleteUser() {
		return Result.empty();
	}
}
