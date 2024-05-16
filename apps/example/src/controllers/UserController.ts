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

	@Read(UserDTO)
	getUser() {
		return Result.single(new UserDTO());
	}

	@Read([UserDTO])
	getUsers(@Query() search: UserSearch) {
		return Result.multiple([new UserDTO()]);
	}

	@Create(UserDTO)
	createUser() {
		return Result.single(new UserDTO());
	}

	@Update(UserDTO)
	updateUser() {
		return Result.single(new UserDTO());
	}

	@Delete(UserDTO)
	deleteUser() {
		return Result.empty();
	}
}
